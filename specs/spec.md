# Orange AI Frontend Redesign Spec

## Project overview
Orange AI is a browser-based coding agent workspace with a React/Vite frontend and an Express/TypeScript backend. The application lets users configure AI provider credentials, stream agent responses, create and reuse sandbox sessions, inspect generated files, and manage multiple chat threads. The redesign replaces the entire frontend presentation layer while preserving all existing backend contracts, routes, state transitions, and business logic.

## Goals
- Replace the current UI with the provided `frontend-design.html` visual system.
- Keep all existing functionality intact: chat streaming, tool status chips, sandbox file tree, file preview, settings, provider/model selection, mobile tab switching, and chat history.
- Add a redesigned sidebar that matches the provided design language even though the source mockup has no sidebar.
- Remove obsolete UI code, assets, and styling so only the new design system remains.
- Deliver a production-ready frontend that builds cleanly and feels responsive.

## Design direction
- Primary reference: `/workspace/uploads/19bd2403-1700-42dc-8a92-87447d62ad6d/frontend-design.html`
- Visual style: warm off-white canvas, yellow accent, rounded cards, soft shadows, minimal borders, monospace code accents, clean desktop split-view, mobile bottom tabs.
- Typography: Inter for UI copy and Fira Code for code/editor details.
- Motion: short, subtle transitions only; no heavy or laggy effects.
- Sidebar: extend the same color palette, radius, border, and shadow language from the supplied design.

## Technical stack decisions
- Frontend: React 19 + TypeScript + Vite + React Router + Zustand.
- Backend: existing Express/TypeScript server unchanged except environment configuration.
- Styling: plain CSS in `frontend/src/index.css`, rewritten from scratch to match the new design.
- Icons: `lucide-react` reuse allowed for functional parity.
- State and API contracts: keep existing store, hook, and API module shapes unless a view-only refactor requires local composition changes.

## Architecture rules
- Preserve `/` as the only application route.
- Keep backend endpoints and SSE payload contract unchanged.
- Keep Zustand state as the source of truth for chats, runtime, settings, file tree, and selected file.
- New UI components may replace all old components, but must consume the same functional props or clearly encapsulate equivalent logic.
- Remove unused assets, styles, imports, and dead UI components.
- Ensure responsive behavior for desktop and mobile layouts from the provided design.

## Feature list
| Feature | Status | Spec |
|---|---|---|
| Workspace shell and navigation | done | `specs/workspace-shell/document.md` |
| Chat experience and composer | done | `specs/chat-experience/document.md` |
| File workspace and editor preview | done | `specs/file-workspace/document.md` |
| Settings and provider configuration flow | done | `specs/settings-flow/document.md` |

## Known constraints
- The provided design is a static HTML export, not a componentized app.
- The source mockup does not include the chat history sidebar, so the sidebar must be newly designed in the same system.
- The app can only exercise real chat streaming when valid provider and E2B credentials are supplied by the user.