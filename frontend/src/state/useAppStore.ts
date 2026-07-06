import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  AgentTranscriptMessage,
  ChatThread,
  FileNode,
  ProviderId,
  ProviderMeta,
  ProviderModel,
  ProviderState,
  RuntimeState,
  SandboxSummary,
  ToolChip,
  UiMessage,
} from '../types/app'
import { createEmptyChat, firstMessageTitle, makeId } from '../utils/chat'

type AppState = {
  chats: ChatThread[]
  activeChatId: string | null
  sidebarOpen: boolean
  mobileTab: 'chat' | 'files'
  settingsOpen: boolean
  providerMeta: Record<ProviderId, ProviderMeta>
  providers: Record<ProviderId, ProviderState>
  selectedProvider: ProviderId
  selectedModel: string
  e2bApiKey: string
  e2bTemplateId: string
  runtime: RuntimeState
  ensureChat: () => void
  createChat: () => void
  selectChat: (chatId: string) => void
  deleteChat: (chatId: string) => void
  clearCurrentChat: () => void
  setSidebarOpen: (value: boolean) => void
  setMobileTab: (tab: 'chat' | 'files') => void
  setSettingsOpen: (value: boolean) => void
  setProviderMeta: (meta: Record<ProviderId, ProviderMeta>) => void
  updateProvider: (provider: ProviderId, patch: Partial<ProviderState>) => void
  setProviderModels: (provider: ProviderId, models: ProviderModel[], error?: string) => void
  setProviderStatus: (provider: ProviderId, status: ProviderState['status'], error?: string) => void
  setSelectedProvider: (provider: ProviderId) => void
  setSelectedModel: (model: string) => void
  setE2bApiKey: (value: string) => void
  setE2bTemplateId: (value: string) => void
  startStream: (userMessage: string) => void
  appendToken: (token: string) => void
  addToolChip: (label: string) => void
  resolveToolChip: (toolName: string, success: boolean) => void
  setRuntimeStatus: (phase: RuntimeState['statusPhase'], label: string, error?: string) => void
  setIteration: (iteration: number, maxIterations: number) => void
  finishStream: (transcript: AgentTranscriptMessage[], sandbox?: SandboxSummary) => void
  failStream: (message: string) => void
  setFileTree: (tree: FileNode[]) => void
  setSelectedFile: (filePath: string, content: string) => void
}

const defaultMeta: Record<ProviderId, ProviderMeta> = {
  openrouter: {
    label: 'OpenRouter',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    docsUrl: 'https://openrouter.ai/docs/quickstart',
  },
  groq: {
    label: 'Groq',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    docsUrl: 'https://console.groq.com/docs/openai',
  },
  nvidia: {
    label: 'NVIDIA NIM',
    defaultBaseUrl: 'https://integrate.api.nvidia.com/v1',
    docsUrl: 'https://docs.api.nvidia.com/nim/reference/llm-apis',
  },
}

const initialProviderState = (meta: Record<ProviderId, ProviderMeta>): Record<ProviderId, ProviderState> => ({
  openrouter: {
    apiKey: '',
    baseUrl: meta.openrouter.defaultBaseUrl,
    models: [],
    status: 'idle',
  },
  groq: {
    apiKey: '',
    baseUrl: meta.groq.defaultBaseUrl,
    models: [],
    status: 'idle',
  },
  nvidia: {
    apiKey: '',
    baseUrl: meta.nvidia.defaultBaseUrl,
    models: [],
    status: 'idle',
  },
})

const initialRuntime: RuntimeState = {
  isStreaming: false,
  statusPhase: 'idle',
  statusLabel: '',
  iteration: 0,
  maxIterations: 1000,
}

function updateActiveChat(chats: ChatThread[], activeChatId: string | null, updater: (chat: ChatThread) => ChatThread) {
  return chats.map((chat) => (chat.id === activeChatId ? updater(chat) : chat))
}

function getActiveChat(state: Pick<AppState, 'chats' | 'activeChatId'>): ChatThread | undefined {
  return state.chats.find((chat) => chat.id === state.activeChatId)
}

function ensureAssistantMessage(chat: ChatThread): UiMessage {
  const lastMessage = chat.messages.at(-1)
  if (lastMessage?.role === 'assistant' && lastMessage.streaming) {
    return lastMessage
  }

  const assistant: UiMessage = {
    id: makeId('assistant'),
    role: 'assistant',
    content: '',
    toolChips: [],
    streaming: true,
  }

  chat.messages.push(assistant)
  return assistant
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      chats: [createEmptyChat()],
      activeChatId: null,
      sidebarOpen: true,
      mobileTab: 'chat',
      settingsOpen: false,
      providerMeta: defaultMeta,
      providers: initialProviderState(defaultMeta),
      selectedProvider: 'openrouter',
      selectedModel: '',
      e2bApiKey: '',
      e2bTemplateId: '',
      runtime: initialRuntime,
      ensureChat: () => {
        const active = get().activeChatId
        const chats = get().chats
        if (!chats.length) {
          const newChat = createEmptyChat()
          set({ chats: [newChat], activeChatId: newChat.id })
          return
        }

        if (!active) {
          set({ activeChatId: chats[0]?.id ?? null })
        }
      },
      createChat: () => {
        const chat = createEmptyChat()
        set((state) => ({
          chats: [chat, ...state.chats],
          activeChatId: chat.id,
          mobileTab: 'chat',
        }))
      },
      selectChat: (chatId) => set({ activeChatId: chatId, mobileTab: 'chat' }),
      deleteChat: (chatId) =>
        set((state) => {
          const nextChats = state.chats.filter((chat) => chat.id !== chatId)
          const ensured = nextChats.length ? nextChats : [createEmptyChat()]
          const activeChatId =
            state.activeChatId === chatId ? ensured[0]?.id ?? null : state.activeChatId
          return { chats: ensured, activeChatId }
        }),
      clearCurrentChat: () =>
        set((state) => ({
          chats: updateActiveChat(state.chats, state.activeChatId, (chat) => ({
            ...chat,
            title: 'New chat',
            messages: [],
            transcript: [],
            sandbox: undefined,
            fileTree: [],
            selectedFileContent: undefined,
            selectedFilePath: undefined,
            updatedAt: new Date().toISOString(),
          })),
          runtime: initialRuntime,
        })),
      setSidebarOpen: (value) => set({ sidebarOpen: value }),
      setMobileTab: (tab) => set({ mobileTab: tab }),
      setSettingsOpen: (value) => set({ settingsOpen: value }),
      setProviderMeta: (meta) =>
        set((state) => ({
          providerMeta: meta,
          providers: {
            openrouter: {
              ...state.providers.openrouter,
              baseUrl: state.providers.openrouter.baseUrl || meta.openrouter.defaultBaseUrl,
            },
            groq: {
              ...state.providers.groq,
              baseUrl: state.providers.groq.baseUrl || meta.groq.defaultBaseUrl,
            },
            nvidia: {
              ...state.providers.nvidia,
              baseUrl: state.providers.nvidia.baseUrl || meta.nvidia.defaultBaseUrl,
            },
          },
        })),
      updateProvider: (provider, patch) =>
        set((state) => ({
          providers: {
            ...state.providers,
            [provider]: {
              ...state.providers[provider],
              ...patch,
            },
          },
        })),
      setProviderModels: (provider, models, error) =>
        set((state) => {
          const selectedModel =
            state.selectedProvider === provider && (!state.selectedModel || !models.some((model) => model.id === state.selectedModel))
              ? models[0]?.id ?? ''
              : state.selectedModel

          return {
            providers: {
              ...state.providers,
              [provider]: {
                ...state.providers[provider],
                models,
                status: error ? 'error' : 'ready',
                error,
              },
            },
            selectedModel,
          }
        }),
      setProviderStatus: (provider, status, error) =>
        set((state) => ({
          providers: {
            ...state.providers,
            [provider]: {
              ...state.providers[provider],
              status,
              error,
            },
          },
        })),
      setSelectedProvider: (provider) =>
        set((state) => ({
          selectedProvider: provider,
          selectedModel: state.providers[provider].models[0]?.id ?? '',
        })),
      setSelectedModel: (model) => set({ selectedModel: model }),
      setE2bApiKey: (value) => set({ e2bApiKey: value }),
      setE2bTemplateId: (value) => set({ e2bTemplateId: value }),
      startStream: (userMessage) =>
        set((state) => {
          const nextChats = [...state.chats]
          const activeChat = getActiveChat(state) ?? nextChats[0]
          if (!activeChat) {
            return state
          }

          const updated = updateActiveChat(nextChats, activeChat.id, (chat) => {
            const nextMessages = [...chat.messages]
            nextMessages.push({
              id: makeId('user'),
              role: 'user',
              content: userMessage,
              toolChips: [],
            })
            nextMessages.push({
              id: makeId('assistant'),
              role: 'assistant',
              content: '',
              toolChips: [],
              streaming: true,
            })

            return {
              ...chat,
              title: chat.messages.length === 0 ? firstMessageTitle(userMessage) : chat.title,
              messages: nextMessages,
              updatedAt: new Date().toISOString(),
            }
          })

          return {
            chats: updated,
            activeChatId: activeChat.id,
            runtime: {
              isStreaming: true,
              statusPhase: 'thinking',
              statusLabel: 'Thinking...',
              iteration: 0,
              maxIterations: 1000,
            },
          }
        }),
      appendToken: (token) =>
        set((state) => ({
          chats: updateActiveChat(state.chats, state.activeChatId, (chat) => {
            const nextChat = { ...chat, messages: [...chat.messages], updatedAt: new Date().toISOString() }
            const assistant = ensureAssistantMessage(nextChat)
            assistant.content += token
            assistant.streaming = true
            return nextChat
          }),
        })),
      addToolChip: (label) =>
        set((state) => ({
          chats: updateActiveChat(state.chats, state.activeChatId, (chat) => {
            const nextChat = { ...chat, messages: [...chat.messages], updatedAt: new Date().toISOString() }
            const assistant = ensureAssistantMessage(nextChat)
            const kind = label.startsWith('Create:') ? 'create' : 'read'
            const path = label.split(':').slice(1).join(':').trim()
            const chip: ToolChip = {
              id: makeId('tool'),
              label,
              kind,
              path,
            }
            assistant.toolChips = [...assistant.toolChips, chip]
            return nextChat
          }),
        })),
      resolveToolChip: (toolName, success) =>
        set((state) => ({
          chats: updateActiveChat(state.chats, state.activeChatId, (chat) => {
            const nextChat = { ...chat, messages: [...chat.messages], updatedAt: new Date().toISOString() }
            const lastAssistant = [...nextChat.messages].reverse().find((message) => message.role === 'assistant')
            if (!lastAssistant) return nextChat
            const kind = toolName === 'file_write' ? 'create' : 'read'
            const pendingChip = lastAssistant.toolChips.find((chip) => chip.kind === kind && chip.success === undefined)
            if (pendingChip) {
              pendingChip.success = success
            }
            return nextChat
          }),
        })),
      setRuntimeStatus: (phase, label, error) =>
        set((state) => ({
          runtime: {
            ...state.runtime,
            statusPhase: phase,
            statusLabel: label,
            error,
          },
        })),
      setIteration: (iteration, maxIterations) =>
        set((state) => ({
          runtime: {
            ...state.runtime,
            iteration,
            maxIterations,
          },
        })),
      finishStream: (transcript, sandbox) =>
        set((state) => ({
          chats: updateActiveChat(state.chats, state.activeChatId, (chat) => ({
            ...chat,
            transcript,
            sandbox: sandbox ?? chat.sandbox,
            messages: chat.messages.map((message, index, source) =>
              index === source.length - 1 && message.role === 'assistant'
                ? { ...message, streaming: false }
                : message,
            ),
            updatedAt: new Date().toISOString(),
          })),
          runtime: {
            ...state.runtime,
            isStreaming: false,
            statusPhase: 'idle',
            statusLabel: '',
            error: undefined,
          },
        })),
      failStream: (message) =>
        set((state) => ({
          chats: updateActiveChat(state.chats, state.activeChatId, (chat) => ({
            ...chat,
            messages: chat.messages.map((item, index, source) =>
              index === source.length - 1 && item.role === 'assistant' && item.streaming
                ? {
                    ...item,
                    streaming: false,
                    content: item.content || `Error: ${message}`,
                  }
                : item,
            ),
            updatedAt: new Date().toISOString(),
          })),
          runtime: {
            ...state.runtime,
            isStreaming: false,
            statusPhase: 'error',
            statusLabel: 'Stream failed',
            error: message,
          },
        })),
      setFileTree: (tree) =>
        set((state) => ({
          chats: updateActiveChat(state.chats, state.activeChatId, (chat) => ({
            ...chat,
            fileTree: tree,
            updatedAt: new Date().toISOString(),
          })),
        })),
      setSelectedFile: (filePath, content) =>
        set((state) => ({
          chats: updateActiveChat(state.chats, state.activeChatId, (chat) => ({
            ...chat,
            selectedFilePath: filePath,
            selectedFileContent: content,
            updatedAt: new Date().toISOString(),
          })),
        })),
    }),
    {
      name: 'ai-sandbox-coding-agent',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        chats: state.chats,
        activeChatId: state.activeChatId,
        sidebarOpen: state.sidebarOpen,
        mobileTab: state.mobileTab,
        providerMeta: state.providerMeta,
        providers: state.providers,
        selectedProvider: state.selectedProvider,
        selectedModel: state.selectedModel,
        e2bApiKey: state.e2bApiKey,
        e2bTemplateId: state.e2bTemplateId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.ensureChat()
      },
    },
  ),
)
