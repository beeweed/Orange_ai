# E2B Sandbox Lifecycle and File Tools

## Overview
The application creates an E2B sandbox on the first user message of a chat using the configured E2B API key, optional template ID, and a one-hour timeout. File tool operations execute directly against the sandbox filesystem.

## Goals
- Make sandbox creation automatic and visible to the user.
- Ensure file reads/writes operate on real sandbox files.
- Expose a tree-based sandbox file explorer that can refresh on demand.

## Scope / non-goals
- In scope: sandbox create/connect lifecycle during the session, file tools, file tree listing, selected file preview.
- Out of scope: long-term sandbox persistence beyond current chat session, sandbox sharing, non-file command execution tools.

## User flows / UX / design notes
- Before first turn, chat is blocked until settings contain E2B key.
- On first send, UI shows `Creating sandbox...` with shiny animation.
- Once created, the chat proceeds automatically.
- Right panel shows current sandbox files. User can refresh explorer manually.
- Tool chips display `Create: PATH` or `Read: PATH` as operations happen.

## Functional requirements
1. Create sandbox with latest E2B SDK via `Sandbox.create`.
2. Use one-hour timeout (`60 * 60 * 1000` ms).
3. Pass optional custom template ID when provided by the user.
4. Support `file_read` tool returning content with line numbers.
5. Support `file_write` tool creating or overwriting files with full content.
6. Validate tool paths to absolute `/home/user/` paths.
7. File read missing-path response must be a structured error that lets the agent continue.
8. Provide backend endpoints to list sandbox files and read file preview for the UI.
9. Support manual file tree refresh; optional watch support can be added later.

## Data model / schema
- SandboxConfig
  - apiKey: string
  - templateId?: string
  - timeoutMs: number
- SandboxSession
  - sandboxId: string
  - templateId?: string
  - createdAt: ISO string
- FileNode
  - name: string
  - path: string
  - type: `file | dir`
  - children?: FileNode[]
  - extension?: string

## API contracts
- `POST /api/sandbox/create`
  - request: `{ apiKey, templateId? }`
  - response: `{ sandboxId, templateId?, createdAt }`
- `POST /api/sandbox/files/tree`
  - request: `{ sandboxId, apiKey, path? }`
  - response: `{ tree: FileNode[] }`
- `POST /api/sandbox/files/read`
  - request: `{ sandboxId, apiKey, filePath }`
  - response: `{ content, exists }`

## Edge cases / failure modes
- Missing E2B key
- Invalid template ID
- Sandbox creation timeout
- Sandbox expired or killed mid-session
- Binary or huge file preview in explorer
- Recursive listing on large directories

## Acceptance criteria
- First user message auto-creates sandbox when needed.
- Agent file tool operations affect the sandbox and appear in explorer after refresh.
- Missing file read errors are structured and non-fatal to the agent loop.

## Test plan / test cases
- Sandbox creation success/failure
- File write creates nested directories and overwrites existing files
- File read returns numbered text
- Invalid path rejected
- Explorer lists directories recursively and previews a selected file

## Implementation notes
- Keep a sandbox service wrapper around E2B SDK.
- Use `sandbox.files.write`, `read`, `list`, and `exists`.
- For explorer preview, cap UI preview length but keep tool read unlimited.

## Status / open questions
- Status: planned
- Open questions: none blocking