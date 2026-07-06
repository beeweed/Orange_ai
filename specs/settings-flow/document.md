# Settings and Provider Configuration Flow

## Overview
Rebuild the settings modal to match the supplied design while preserving provider credential entry, model loading, E2B configuration, validation, and save behavior.

## Goals
- Match the modal styling and card layout from the provided design.
- Keep provider configuration and save workflow unchanged functionally.
- Make status, errors, and help links clearer.

## Scope / non-goals
- In scope: overlay, modal layout, provider cards, input fields, model status messaging, save/cancel controls.
- Out of scope: secret storage changes, backend auth changes, or new providers.

## User flows / UX / design notes
- Modal opens from header or missing-config send attempt.
- Each provider should present label, description/docs link, key/base URL fields, and model readiness status.
- E2B configuration should appear alongside provider configuration with clear helper copy.
- Save closes the modal after model fetch attempts finish.

## Functional requirements
- Edit provider API key and base URL.
- Edit E2B API key and optional template ID.
- Save triggers provider model loading for configured providers.
- Show ready/loading/error state per provider.
- Preserve cancel behavior without unintended mutation beyond current controlled inputs.

## Data model / schema
- Uses `providerMeta`, `providers`, `e2bApiKey`, `e2bTemplateId`, and save handlers from existing store/page logic.
- No schema changes.

## API contracts
- Uses existing `/api/providers/metadata` and `/api/providers/models` endpoints.

## Edge cases / failure modes
- Empty provider key: provider remains idle.
- Invalid base URL or backend error: provider card shows error state.
- Slow model fetch: loading state visible and save remains controlled.
- Many providers configured: modal remains scrollable.

## Acceptance criteria
- Settings modal visually matches the provided design system.
- Provider and E2B settings can still be edited and saved.
- Errors are understandable and do not break the layout.

## Test plan / test cases
- Open and close modal from header.
- Save with no API keys and verify idle statuses remain.
- Save with a dummy invalid key and verify error state appears.
- Verify E2B fields persist after page reload via Zustand persistence.

## Implementation notes
- Build provider cards as reusable components.
- Mask secret fields with password inputs.
- Preserve focus management and accessible labels.

## Status / open questions
- Status: done
- Open questions: none.