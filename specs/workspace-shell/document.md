# Workspace Shell and Navigation

## Overview
Define the main application shell for desktop and mobile, including the redesigned left chat-history sidebar, chat panel container, workspace container, responsive layout switching, and shared headers.

## Goals
- Match the supplied design layout and spacing on desktop and mobile.
- Introduce a new sidebar that visually belongs to the supplied design system.
- Keep navigation between chats and mobile tabs intact.

## Scope / non-goals
- In scope: shell layout, sidebar, headers, mobile tab bar, empty shell states.
- Out of scope: backend API changes, transcript logic changes, authentication, or new routes.

## User flows / UX / design notes
- Desktop: sidebar on the far left, redesigned chat panel center-left, workspace panel right.
- Mobile: no persistent sidebar; keep chat/files tab switcher at the bottom.
- Sidebar should show create chat action, chat list, active state, delete affordance, and compact collapse behavior.
- Header controls keep reset/settings affordances but adopt the mockup’s icon-button treatment.

## Functional requirements
- Render existing chat threads from Zustand.
- Allow create/select/delete chat actions.
- Support sidebar open/collapsed state.
- Preserve mobile tab switching between chat and files.
- Display active chat title in headers.

## Data model / schema
- Uses `ChatThread[]`, `activeChatId`, `sidebarOpen`, and `mobileTab` from Zustand.
- No new persisted backend schema.

## API contracts
- No new API endpoints.
- Existing frontend API layer remains unchanged.

## Edge cases / failure modes
- No chats stored: create and select a fallback empty chat.
- Long titles: truncate gracefully.
- Very narrow widths: hide desktop shell, use mobile shell.

## Acceptance criteria
- Desktop shell visually aligns with the provided design language.
- Sidebar feels native to the new design and not like the legacy UI.
- Mobile shell mirrors the supplied tabbed experience.
- All chat list actions still work.

## Test plan / test cases
- Load app with persisted chats and verify active chat selection.
- Create a new chat and verify it becomes active.
- Delete the active chat and verify fallback chat behavior.
- Collapse/expand sidebar on desktop.
- Resize to mobile and verify chat/files bottom tab switching.

## Implementation notes
- Replace existing shell-related components with new reusable components and CSS classes.
- Centralize visual tokens in `index.css`.
- Maintain semantic sections and accessible button labels.

## Status / open questions
- Status: done
- Open questions: none; the attached HTML export is the source of truth for visual direction.