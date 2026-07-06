import { useCallback, useRef } from 'react'
import { BACKEND_URL } from '../lib/env'
import { fetchFileTree } from '../lib/api'
import { useAppStore } from '../state/useAppStore'
import type { AgentTranscriptMessage, SandboxSummary } from '../types/app'

type ChatStreamPayload = {
  chatId: string
  message: string
  transcript: AgentTranscriptMessage[]
  provider: 'openrouter' | 'groq' | 'nvidia'
  model: string
  credentials: {
    apiKey: string
    baseUrl?: string
  }
  sandbox: {
    apiKey: string
    sandboxId?: string
    templateId?: string
    timeoutMs?: number
  }
}

async function parseSseChunk(
  buffer: string,
  onEvent: (event: string, payload: unknown) => Promise<void> | void,
) {
  const frames = buffer.split('\n\n')
  const trailing = frames.pop() ?? ''

  for (const frame of frames) {
    if (!frame.trim()) continue
    const lines = frame.split('\n')
    const event = lines.find((line) => line.startsWith('event:'))?.replace('event:', '').trim() ?? 'message'
    const dataLine = lines.find((line) => line.startsWith('data:'))?.replace('data:', '').trim() ?? 'null'
    await onEvent(event, JSON.parse(dataLine))
  }

  return trailing
}

export function useChatStream() {
  const controllerRef = useRef<AbortController | null>(null)
  const failStream = useAppStore((state) => state.failStream)
  const appendToken = useAppStore((state) => state.appendToken)
  const addToolChip = useAppStore((state) => state.addToolChip)
  const resolveToolChip = useAppStore((state) => state.resolveToolChip)
  const setRuntimeStatus = useAppStore((state) => state.setRuntimeStatus)
  const setIteration = useAppStore((state) => state.setIteration)
  const finishStream = useAppStore((state) => state.finishStream)
  const setFileTree = useAppStore((state) => state.setFileTree)
  const activeChat = useAppStore((state) => state.chats.find((chat) => chat.id === state.activeChatId))
  const e2bApiKey = useAppStore((state) => state.e2bApiKey)

  const stop = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
    setRuntimeStatus('idle', '')
  }, [setRuntimeStatus])

  const streamChat = useCallback(
    async (payload: ChatStreamPayload) => {
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller

      try {
        const response = await fetch(`${BACKEND_URL}/api/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })

        if (!response.ok || !response.body) {
          throw new Error('Unable to start chat stream.')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let sandbox: SandboxSummary | undefined

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          buffer = await parseSseChunk(buffer, async (event, payloadData) => {
            switch (event) {
              case 'status': {
                const payloadValue = payloadData as { phase: 'thinking' | 'creating_sandbox' | 'tool_running'; label: string }
                setRuntimeStatus(payloadValue.phase, payloadValue.label)
                break
              }
              case 'iteration': {
                const payloadValue = payloadData as { current: number; max: number }
                setIteration(payloadValue.current, payloadValue.max)
                break
              }
              case 'token': {
                const payloadValue = payloadData as { value: string }
                appendToken(payloadValue.value)
                break
              }
              case 'tool_call': {
                const payloadValue = payloadData as { chipLabel: string }
                addToolChip(payloadValue.chipLabel)
                break
              }
              case 'tool_result': {
                const payloadValue = payloadData as { toolName: string; success: boolean }
                resolveToolChip(payloadValue.toolName, payloadValue.success)
                break
              }
              case 'sandbox': {
                sandbox = (payloadData as { sandbox: SandboxSummary }).sandbox
                break
              }
              case 'done': {
                const payloadValue = payloadData as {
                  transcript: AgentTranscriptMessage[]
                  sandbox?: SandboxSummary
                }
                sandbox = payloadValue.sandbox ?? sandbox
                finishStream(payloadValue.transcript, sandbox)
                if (sandbox && activeChat && e2bApiKey) {
                  const tree = await fetchFileTree({ sandboxId: sandbox.sandboxId, apiKey: e2bApiKey })
                  setFileTree(tree)
                }
                break
              }
              case 'error': {
                const payloadValue = payloadData as { message: string }
                throw new Error(payloadValue.message)
              }
              default:
                break
            }
          })
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        failStream(error instanceof Error ? error.message : 'Streaming failed.')
      } finally {
        controllerRef.current = null
      }
    },
    [activeChat, addToolChip, appendToken, e2bApiKey, failStream, finishStream, resolveToolChip, setFileTree, setIteration, setRuntimeStatus],
  )

  return { streamChat, stop }
}
