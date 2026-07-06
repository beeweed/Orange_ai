# Agent Runtime with Native Tool Calling

## Overview
The backend agent executes an autonomous ReAct-style loop using native tool calling only. The model decides whether to call `file_read` and `file_write`, the backend executes them in the E2B sandbox, and the loop continues until a final assistant response or the max iteration limit is hit.

## Goals
- Use only provider-native function/tool calling via the LLM API.
- Preserve the full transcript, including tool calls and tool results, across the active chat.
- Support up to 1000 iterations per user message, resetting the visible counter on each new user input.

## Scope / non-goals
- In scope: orchestration loop, tool registry, transcript management, system prompt, streaming bridge.
- Out of scope: summarization-based memory compression, agent planning UI, multi-agent orchestration.

## User flows / UX / design notes
- User sends a message.
- If sandbox missing, backend creates one first.
- Backend starts streaming assistant tokens.
- When the model issues a tool call, the content stream pauses, tool activity appears, tool result is recorded, and streaming resumes on the next LLM call.
- Iteration count is streamed to the UI as the loop advances.

## Functional requirements
1. Maintain an append-only message array for each chat session.
2. Store user input, assistant content, assistant tool-call messages, tool results, and tool execution status.
3. Use the OpenAI-compatible `tools` parameter on every model call.
4. Never emit tool calls as text or markdown.
5. Register `file_read` and `file_write` in the tool registry.
6. Enforce `maxIterations = 1000` per request.
7. Return the best possible final answer if the iteration limit is reached.
8. Use sequential tool execution for determinism (`parallel_tool_calls: false`).
9. Support token streaming from providers and SSE fan-out to frontend.
10. Expose structured SSE events for status, token, tool-call, tool-result, iteration, sandbox, done, and error.

## Data model / schema
- AgentMessage
  - role: `system | user | assistant | tool`
  - content: string | array
  - tool_calls?: structured provider tool calls
  - tool_call_id?: string
  - name?: string
  - timestamp: ISO string
- AgentRunState
  - iteration: number
  - maxIterations: 1000
  - sandboxId?: string
  - status: `idle | creating_sandbox | streaming | tool_running | complete | error`

## API contracts
- `POST /api/chat/stream`
  - request: `{ chatId, message, provider, model, credentials, sandbox: { apiKey, templateId?, timeoutMs? }, transcript }`
  - response: `text/event-stream`
- Event payloads
  - `status`: `{ phase, label }`
  - `iteration`: `{ current, max }`
  - `token`: `{ value }`
  - `tool_call`: `{ toolName, args, chipLabel }`
  - `tool_result`: `{ toolName, success, outputPreview }`
  - `done`: `{ assistantMessage, transcript, sandbox }`
  - `error`: `{ message, recoverable }`

## Edge cases / failure modes
- Provider returns invalid tool arguments JSON
- Tool execution fails because file is missing
- Tool execution fails because path is invalid
- Provider does not support tools for selected model
- Client disconnects mid-stream
- Iteration limit reached without completion

## Acceptance criteria
- Tool calls come only from provider API structured responses.
- A single chat run can interleave tokens, tool calls, tool results, and resumed text streaming.
- Transcript returned to frontend includes everything needed to continue the next turn with full memory.

## Test plan / test cases
- Chat turn with no tools
- Chat turn with read tool then final answer
- Chat turn with write tool then read tool then final answer
- Invalid path tool call handling
- Iteration counter resets per new user message and increments during loop
- Streaming resumes after tool result

## Implementation notes
- Use a provider-agnostic client factory with OpenAI SDK base URL overrides.
- Append assistant tool-call message before executing tools.
- Append tool messages after each execution.
- Keep the full transcript in frontend localStorage and send it back each turn to avoid server memory coupling.

## Status / open questions
- Status: planned
- Open questions: none blocking