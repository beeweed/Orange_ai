# Chat Experience and Composer

## Overview
Rebuild the message transcript view, empty/welcome state, runtime status presentation, tool chips, composer card, provider/model picker affordances, and send/stop interactions to match the provided design.

## Goals
- Preserve streaming behavior while improving perceived responsiveness.
- Match the supplied chat panel layout, spacing, typography, and component styling.
- Clearly communicate readiness, runtime status, iteration progress, and errors.

## Scope / non-goals
- In scope: transcript rendering, streaming assistant state, welcome state, composer card, status banners, tool chip styling.
- Out of scope: changing SSE protocol, tool execution logic, or provider list semantics.

## User flows / UX / design notes
- Empty chat should render a polished welcome block derived from the design language.
- User messages render in rounded cards with avatar treatment.
- Assistant responses render as clean text blocks with tool chips beneath when present.
- Runtime states show thinking/tool/sandbox indicators and stop control.
- Composer uses the provided large rounded input card and compact provider/model controls.

## Functional requirements
- Render all existing messages and streamed tokens.
- Show tool chips from `toolChips` with success state.
- Trigger send on button click and Ctrl/Cmd+Enter.
- Stop active stream from the stop control.
- Open settings when user tries to send without required configuration.
- Reflect selected provider and selected model.

## Data model / schema
- Uses `UiMessage[]`, `RuntimeState`, provider metadata/state, selected provider/model, and input local state.
- No schema changes.

## API contracts
- Uses existing `/api/chat/stream` SSE flow.
- Uses existing provider metadata and model loading APIs.

## Edge cases / failure modes
- Missing keys/model/E2B key: show clear warning and route user to settings.
- Stream failure: surface runtime error state without breaking layout.
- Long assistant responses or code-heavy content: preserve whitespace and wrapping.
- Empty tool chip list: no extra spacing artifact.

## Acceptance criteria
- Streaming, stop, ready-state warning, and tool-chip rendering behave exactly as before.
- Composer and message area visually match the provided design.
- Keyboard and click interactions work without lag.

## Test plan / test cases
- Verify empty chat welcome state.
- Send a message with missing config and confirm settings modal opens.
- Mock or run a real stream and verify incremental token rendering.
- Verify stop action halts stream state.
- Verify tool chips render and update success state.

## Implementation notes
- Build message rendering as small reusable components.
- Use CSS transitions only for hover/entry polish; avoid heavy animation.
- Preserve `data-design-id` attributes on major layout blocks.

## Status / open questions
- Status: done
- Open questions: real streaming requires external credentials not present in repo.