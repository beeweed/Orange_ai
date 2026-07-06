import type { Response } from 'express'
import { CODING_AGENT_SYSTEM_PROMPT } from './systemprompts/systemprompts'
import { agentTools, executeToolCall } from './tools'
import { createProviderClient } from './providers'
import { getOrCreateSandbox } from '../sandbox-service'
import type {
  AgentToolCall,
  AgentTranscriptMessage,
  ChatStreamRequest,
  SandboxSessionSummary,
} from '../types'

const MAX_ITERATIONS = 1000

function now(): string {
  return new Date().toISOString()
}

function writeSse(res: Response, event: string, data: unknown): void {
  res.write(`event: ${event}\n`)
  res.write(`data: ${JSON.stringify(data)}\n\n`)
}

function statusLabel(phase: 'thinking' | 'creating_sandbox' | 'tool_running'): string {
  switch (phase) {
    case 'creating_sandbox':
      return 'Creating sandbox...'
    case 'tool_running':
      return 'Running tool...'
    default:
      return 'Thinking...'
  }
}

function toProviderMessages(transcript: AgentTranscriptMessage[]): Array<Record<string, unknown>> {
  return [
    { role: 'system', content: CODING_AGENT_SYSTEM_PROMPT },
    ...transcript.map((message) => {
      if (message.role === 'assistant' && message.tool_calls) {
        return {
          role: 'assistant',
          content: message.content,
          tool_calls: message.tool_calls,
        }
      }

      if (message.role === 'tool') {
        return {
          role: 'tool',
          content: message.content,
          tool_call_id: message.tool_call_id,
          name: message.name,
        }
      }

      return {
        role: message.role,
        content: message.content,
      }
    }),
  ]
}

function chipLabel(toolName: string, args: string): string {
  try {
    const parsed = JSON.parse(args) as { file_path?: string }
    const filePath = parsed.file_path ?? '/home/user/'
    return toolName === 'file_write' ? `Create: ${filePath}` : `Read: ${filePath}`
  } catch {
    return toolName
  }
}

function previewToolResult(content: string): string {
  return content.length > 320 ? `${content.slice(0, 320)}…` : content
}

function normalizeToolCalls(partials: Map<number, AgentToolCall>): AgentToolCall[] {
  return [...partials.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([, call]) => call)
}

export async function streamChatRun(res: Response, input: ChatStreamRequest): Promise<void> {
  const transcript: AgentTranscriptMessage[] = [...input.transcript]
  transcript.push({
    role: 'user',
    content: input.message,
    timestamp: now(),
  })

  writeSse(res, 'iteration', { current: 0, max: MAX_ITERATIONS })

  const sandboxState = await getOrCreateSandbox({
    apiKey: input.sandbox.apiKey,
    sandboxId: input.sandbox.sandboxId,
    templateId: input.sandbox.templateId,
    timeoutMs: input.sandbox.timeoutMs ?? 60 * 60 * 1000,
  })

  if (sandboxState.created) {
    writeSse(res, 'status', {
      phase: 'creating_sandbox',
      label: statusLabel('creating_sandbox'),
    })
  }

  const sandboxSummary: SandboxSessionSummary = sandboxState.session

  writeSse(res, 'sandbox', {
    created: sandboxState.created,
    sandbox: sandboxSummary,
  })

  const client = createProviderClient({
    provider: input.provider,
    apiKey: input.credentials.apiKey,
    baseUrl: input.credentials.baseUrl,
  })

  for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration += 1) {
    writeSse(res, 'iteration', { current: iteration, max: MAX_ITERATIONS })
    writeSse(res, 'status', { phase: 'thinking', label: statusLabel('thinking') })

    const stream = await client.chat.completions.create({
      model: input.model,
      messages: toProviderMessages(transcript) as never,
      tools: agentTools as never,
      tool_choice: 'auto',
      parallel_tool_calls: false,
      temperature: 0.2,
      stream: true,
    })

    let assistantText = ''
    let finishReason: string | null = null
    const toolCalls = new Map<number, AgentToolCall>()

    for await (const chunk of stream) {
      const choice = chunk.choices[0]
      const delta = choice?.delta

      if (delta?.content) {
        assistantText += delta.content
        writeSse(res, 'token', { value: delta.content })
      }

      if (delta?.tool_calls) {
        for (const toolChunk of delta.tool_calls) {
          const index = toolChunk.index ?? 0
          const current = toolCalls.get(index) ?? {
            id: toolChunk.id ?? `call_${index}`,
            type: 'function',
            function: {
              name: toolChunk.function?.name ?? '',
              arguments: '',
            },
          }

          if (toolChunk.id) {
            current.id = toolChunk.id
          }

          if (toolChunk.function?.name) {
            current.function.name = toolChunk.function.name
          }

          if (toolChunk.function?.arguments) {
            current.function.arguments += toolChunk.function.arguments
          }

          toolCalls.set(index, current)
        }
      }

      if (choice?.finish_reason) {
        finishReason = choice.finish_reason
      }
    }

    const normalizedToolCalls = normalizeToolCalls(toolCalls)

    if (normalizedToolCalls.length > 0 || finishReason === 'tool_calls') {
      transcript.push({
        role: 'assistant',
        content: assistantText,
        tool_calls: normalizedToolCalls,
        timestamp: now(),
      })

      for (const toolCall of normalizedToolCalls) {
        writeSse(res, 'status', {
          phase: 'tool_running',
          label: statusLabel('tool_running'),
        })
        writeSse(res, 'tool_call', {
          toolName: toolCall.function.name,
          args: toolCall.function.arguments,
          chipLabel: chipLabel(toolCall.function.name, toolCall.function.arguments),
        })

        const { result, serialized } = await executeToolCall(toolCall.function.name, toolCall.function.arguments, {
          sandbox: sandboxState.sandbox,
        })

        transcript.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: serialized,
          timestamp: now(),
        })

        writeSse(res, 'tool_result', {
          toolName: toolCall.function.name,
          success: result.ok,
          outputPreview: previewToolResult(serialized),
        })
      }

      continue
    }

    const assistantMessage: AgentTranscriptMessage = {
      role: 'assistant',
      content: assistantText,
      timestamp: now(),
    }

    transcript.push(assistantMessage)

    writeSse(res, 'done', {
      assistantMessage,
      transcript,
      sandbox: sandboxSummary,
    })

    return
  }

  const assistantMessage: AgentTranscriptMessage = {
    role: 'assistant',
    content:
      'I reached the maximum iteration limit for this turn. I preserved all progress so you can continue from the current transcript.',
    timestamp: now(),
  }

  transcript.push(assistantMessage)

  writeSse(res, 'done', {
    assistantMessage,
    transcript,
    sandbox: sandboxSummary,
    limitReached: true,
  })
}
