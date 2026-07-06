# Chat UI, SSE Streaming, and Chat History

## Overview
The frontend provides a responsive AI chat application with a left conversation area, collapsible local chat history, and a right sandbox file explorer. It consumes SSE from the backend and renders tokens progressively.

## Goals
- Match the attached design closely.
- Stream output smoothly token-by-token with visible status changes and tool activity.
- Persist chats in localStorage and restore after refresh.

## Scope / non-goals
- In scope: responsive layout, settings modal, message rendering, chat history CRUD, file explorer, model picker, streaming UX.
- Out of scope: markdown WYSIWYG editing, collaborative presence, server-side persistence.

## User flows / UX / design notes
- Desktop: split layout with chat left and files right.
- Mobile: tab switcher between Chat and Files.
- Sidebar: collapsible chat list with auto-generated titles from the first user message and delete action.
- In chat, assistant responses are plain blocks without bubble chrome.
- Tool activity appears as small chips under the active assistant block.
- Thinking and sandbox creation states use animated shimmering copy.

## Functional requirements
1. Persist chats and settings in localStorage via Zustand persist middleware.
2. Auto-create a new chat if none exists.
3. Title chats from the first user message.
4. Support deleting chats and selecting previous chats.
5. Stream backend SSE events incrementally into the active assistant message.
6. Interrupt content stream visually during tool calls and resume after tool results.
7. Show `Thinking...` and `Creating sandbox...` statuses in chat.
8. Show top iteration pill as `Iteration x/1000`, reset on each new user message.
9. Right panel shows file tree and selected file preview with refresh button.
10. Frontend backend URL must come only from `frontend/.env` / Vite env.
11. Application must adapt to narrow widths with bottom nav for Chat/Files.

## Data model / schema
- ChatThread
  - id: string
  - title: string
  - createdAt: ISO string
  - updatedAt: ISO string
  - sandbox?: SandboxSessionSummary
  - messages: UiMessage[]
  - transcript: AgentMessage[]
- UiMessage
  - id: string
  - role: `user | assistant | status`
  - content: string
  - toolChips: ToolChip[]
  - streaming: boolean
- ToolChip
  - id: string
  - kind: `read | create`
  - label: string
  - path: string
  - success?: boolean

## API contracts
- Consumes backend SSE from `POST /api/chat/stream`
- Uses sandbox explorer endpoints for tree and file preview
- Uses provider metadata/model endpoints for settings modal

## Edge cases / failure modes
- Page reload during stream
- Provider or sandbox settings missing
- File explorer refresh before sandbox exists
- Network interruption during SSE
- Huge assistant output

## Acceptance criteria
- Refreshing the page restores chats, settings, and selected thread from localStorage.
- Streaming appears progressively, not as a single final block.
- The layout remains usable on desktop, tablet, and mobile.

## Test plan / test cases
- New chat creation and auto-title
- Delete chat
- Save settings and reload
- Stream tokens into assistant message
- Tool chip rendering and resume after tool completion
- Mobile tab navigation and responsive file panel

## Implementation notes
- Use a dedicated streaming hook to parse SSE event frames.
- Keep UI messages derived from transcript plus stream events.
- Render preview content with numbered lines in a code-like panel.

## Status / open questions
- Status: planned
- Open questions: none blocking