# AI Sandbox Coding Agent — Master Spec

## Project overview
Build a production-grade web application that lets a user configure an LLM provider and an E2B sandbox, chat with an autonomous coding agent, stream responses token-by-token in real time, and inspect sandbox files in a tree explorer. The application must use browser localStorage for client persistence and must not require a database.

## Goals
- Provide a real autonomous coding agent with native tool calling.
- Support sandbox-backed file read/write/overwrite via E2B.
- Preserve the full conversation state required by the model, including user messages, assistant messages, tool calls, tool results, and failure/success outcomes.
- Deliver smooth production-grade SSE token streaming with tool-call interruption and resume.
- Let users add OpenRouter, Groq, NVIDIA NIM, and E2B credentials from the UI and fetch available models dynamically.
- Match the attached `frontend-design.html` layout and interaction model as closely as practical while remaining fully functional and responsive.

## Design direction
- Reference file: `/workspace/uploads/2e355522-ff97-4f5a-bc77-433bf2777051/frontend-design.html`
- Layout: left chat panel with history drawer, right file explorer/editor preview, top-right settings trigger, mobile tab switcher.
- Theme: high-contrast premium neutral palette adapted from the provided design, with subtle motion and glass/soft-shadow surfaces.
- UX details: user bubbles, assistant plain text blocks, tool activity chips, shiny animated thinking/creating-sandbox indicators, iteration pill, collapsible history sidebar, settings modal.

## Technical stack decisions
- Frontend: React + Vite + TypeScript
- Frontend routing: `react-router-dom`, route definitions in `frontend/src/app/routes/route.ts`
- Frontend state: Zustand with localStorage persistence
- Backend: Node.js + TypeScript + Express
- Validation: Zod
- Logging: Pino + pino-http
- LLM SDK: OpenAI-compatible official `openai` Node SDK against provider-specific base URLs
- Sandbox SDK: latest `e2b` TypeScript SDK
- Persistence: browser localStorage only
- Streaming: Server-Sent Events from backend to frontend using real upstream token streams

## Architecture rules
- Use provider adapters with a shared interface for model listing and chat execution.
- Use only native function/tool calling from the LLM API. Never parse tool calls from assistant text.
- Keep an append-only conversation transcript for the agent runtime; do not truncate within the app runtime.
- Tool results must be serialized back into the conversation and streamed to the UI as structured events.
- The backend owns live sandbox sessions and agent execution; the frontend owns UI state and local chat persistence.
- File operations must be sandbox-scoped and validated to `/home/user/` paths.
- Frontend must handle loading, empty, error, and disconnected streaming states.

## Feature list
| Feature | Status | Spec |
| --- | --- | --- |
| Provider settings and model discovery | planned | `specs/provider-settings/document.md` |
| Agent runtime with native tool calling | planned | `specs/agent-runtime/document.md` |
| E2B sandbox lifecycle and file tools | planned | `specs/e2b-sandbox/document.md` |
| Chat UI, SSE streaming, and chat history | planned | `specs/chat-ui/document.md` |

## Non-goals
- No database, server-side user accounts, or team workspaces
- No deployment automation in this task
- No non-file sandbox execution tools unless needed later

## Research notes
- OpenRouter exposes model listing at `GET /api/v1/models` and uses OpenAI-compatible chat completions at `https://openrouter.ai/api/v1/chat/completions` with Bearer auth.
- Groq exposes model listing at `GET https://api.groq.com/openai/v1/models` and is mostly OpenAI-compatible.
- NVIDIA NIM exposes an OpenAI-compatible API with `GET /v1/models`; hosted catalog examples use `https://integrate.api.nvidia.com/v1/chat/completions`.
- E2B JS SDK supports `Sandbox.create({ timeoutMs })`, `sandbox.files.read(path)`, `sandbox.files.write(path, data)`, `sandbox.files.list(path)`, `sandbox.files.exists(path)`, and `sandbox.files.watchDir(...)`.

## Status
- Specs created
- Implementation not started