# Provider Settings and Model Discovery

## Overview
Users configure API keys for OpenRouter, Groq, NVIDIA NIM, plus E2B sandbox settings from a settings dialog. After saving a provider key, the frontend requests the backend to validate connectivity and fetch the provider's available models.

## Goals
- Make provider onboarding self-service from the UI.
- Support easy addition of future providers through a shared backend adapter system.
- Keep secrets out of localStorage except where explicitly required by this single-user local app flow.

## Scope / non-goals
- In scope: key entry UI, save/delete/update behavior, provider status, model fetching, model selection.
- Out of scope: server-side encryption, multi-user auth, database storage.

## User flows / UX / design notes
- User opens Settings from the header.
- User fills API keys for OpenRouter, Groq, NVIDIA NIM, E2B, and optional E2B template ID.
- User clicks Save Changes.
- App shows connection status and fetches models per configured provider.
- User selects provider + model from the composer model picker.
- If no LLM key is configured, composer shows disabled warning state.

## Functional requirements
1. Support provider forms for `openrouter`, `groq`, `nvidia`.
2. Each provider entry stores API key and last fetch status in Zustand persisted state.
3. Backend endpoint lists models for the given provider using a provider adapter.
4. OpenRouter model list: `GET https://openrouter.ai/api/v1/models`.
5. Groq model list: `GET https://api.groq.com/openai/v1/models`.
6. NVIDIA model list: `GET <baseUrl>/models` where default hosted base URL is `https://integrate.api.nvidia.com/v1`.
7. The architecture must allow adding new providers with minimal new code.
8. UI must show loading, success, empty, and error states per provider.

## Data model / schema
- ProviderConfig
  - id: `openrouter | groq | nvidia`
  - label: string
  - apiKey: string
  - baseUrl?: string
  - models: ProviderModel[]
  - status: `idle | loading | ready | error`
  - error?: string
- ProviderModel
  - id: string
  - name: string
  - contextWindow?: number
  - description?: string
  - supportsTools?: boolean

## API contracts
- `POST /api/providers/models`
  - request: `{ provider: string, apiKey: string, baseUrl?: string }`
  - response: `{ models: ProviderModel[] }`
- `GET /api/providers/metadata`
  - response: supported providers and defaults for UI bootstrap

## Edge cases / failure modes
- Invalid API key
- Provider returns no models
- Provider network timeout
- Hosted NVIDIA base URL override is invalid
- User selects a model that later disappears

## Acceptance criteria
- A user can save a provider key and retrieve models without page reload.
- Model picker updates from the fetched provider results.
- Adding a new provider requires only a new adapter and metadata entry.

## Test plan / test cases
- Fetch OpenRouter models with valid/invalid key
- Fetch Groq models with valid/invalid key
- Fetch NVIDIA models with valid/invalid key
- Verify UI disabled state when no model is configured
- Verify persisted provider settings survive refresh

## Implementation notes
- Use provider adapter classes wrapping the OpenAI SDK or fetch.
- Normalize model list output to one frontend shape.
- Keep provider API keys in frontend state because the user explicitly requested UI-managed keys; backend receives them per request.

## Status / open questions
- Status: planned
- Open questions: none blocking