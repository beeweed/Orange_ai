export type ProviderId = 'openrouter' | 'groq' | 'nvidia';
export type ProviderModel = {
    id: string;
    name: string;
    description?: string;
    contextWindow?: number;
    supportsTools?: boolean;
};
export type ProviderConfig = {
    provider: ProviderId;
    apiKey: string;
    baseUrl?: string;
};
export type SandboxConfigInput = {
    apiKey: string;
    sandboxId?: string;
    templateId?: string;
    timeoutMs?: number;
};
export type SandboxSessionSummary = {
    sandboxId: string;
    templateId?: string;
    createdAt: string;
};
export type AgentToolCall = {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
};
export type AgentTranscriptMessage = {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    tool_calls?: AgentToolCall[];
    tool_call_id?: string;
    name?: string;
    timestamp: string;
};
export type ChatStreamRequest = {
    chatId: string;
    message: string;
    transcript: AgentTranscriptMessage[];
    provider: ProviderId;
    model: string;
    credentials: {
        apiKey: string;
        baseUrl?: string;
    };
    sandbox: SandboxConfigInput;
};
export type FileNode = {
    name: string;
    path: string;
    type: 'file' | 'dir';
    extension?: string;
    children?: FileNode[];
};
export type StructuredToolResult = {
    ok: boolean;
    operation: string;
    file_path: string;
    message: string;
    content_with_line_numbers?: string;
    bytes?: number;
    error?: {
        code: string;
        message: string;
    };
};
//# sourceMappingURL=types.d.ts.map