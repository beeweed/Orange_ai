export type ProviderId = 'openrouter' | 'groq' | 'nvidia'

export type ProviderModel = {
  id: string
  name: string
  description?: string
  contextWindow?: number
  supportsTools?: boolean
}

export type ProviderMeta = {
  label: string
  defaultBaseUrl: string
  docsUrl: string
}

export type ProviderState = {
  apiKey: string
  baseUrl: string
  models: ProviderModel[]
  status: 'idle' | 'loading' | 'ready' | 'error'
  error?: string
}

export type ToolChip = {
  id: string
  kind: 'read' | 'create'
  label: string
  path: string
  success?: boolean
}

export type UiMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolChips: ToolChip[]
  streaming?: boolean
}

export type AgentToolCall = {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export type AgentTranscriptMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  tool_calls?: AgentToolCall[]
  tool_call_id?: string
  name?: string
  timestamp: string
}

export type SandboxSummary = {
  sandboxId: string
  templateId?: string
  createdAt: string
}

export type FileNode = {
  name: string
  path: string
  type: 'file' | 'dir'
  extension?: string
  children?: FileNode[]
}

export type ChatThread = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: UiMessage[]
  transcript: AgentTranscriptMessage[]
  sandbox?: SandboxSummary
  fileTree: FileNode[]
  selectedFilePath?: string
  selectedFileContent?: string
}

export type RuntimeState = {
  isStreaming: boolean
  statusPhase: 'idle' | 'thinking' | 'creating_sandbox' | 'tool_running' | 'error'
  statusLabel: string
  iteration: number
  maxIterations: number
  error?: string
}
