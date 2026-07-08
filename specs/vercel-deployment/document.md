# Vercel Deployment Compatibility

## Overview
Make the existing Orange AI monorepo deploy cleanly on Vercel from the repository root without crashing at the primary URL. The deployment must serve the Vite frontend as a static SPA and expose the Express backend through a Vercel Function entrypoint.

## Goals
- Eliminate the Vercel `FUNCTION_INVOCATION_FAILED` crash at the root deployment URL.
- Keep the existing frontend and backend behavior unchanged for local development.
- Support a root-level Vercel deployment for this monorepo without requiring the frontend to be deployed as a separate project.
- Preserve the ability to point the frontend to an externally hosted backend during local preview.

## Scope / non-goals
- In scope: Vercel build/install configuration, serverless backend entrypoint, frontend API base URL fallback behavior, and local env setup.
- Out of scope: redesigning the UI, changing chat logic, changing provider contracts, or adding authentication.

## User flows / UX / design notes
- Opening the root Vercel deployment URL should load the SPA instead of a serverless crash page.
- Frontend API requests should work in both modes:
  - Local preview: use `frontend/.env` with the exposed backend URL.
  - Vercel deployment: fall back to same-origin API calls when `VITE_BACKEND_URL` is not set.
- Client-side routes should resolve to `index.html`.

## Functional requirements
- Add a Vercel-compatible API entrypoint under `api/`.
- Ensure the backend can be imported by a serverless function without starting an extra listener.
- Keep standalone backend local development working with `npm run dev`.
- Configure Vercel to install frontend and backend dependencies, build the frontend output, and route SPA requests plus API requests correctly.
- Keep the backend endpoint paths stable for the frontend.

## Data model / schema
- No database or persisted schema changes.
- Environment/config values:
  - `VITE_BACKEND_URL` for optional explicit frontend API origin/base.
  - Existing backend env values remain `PORT`, `FRONTEND_ORIGIN`, and `NODE_ENV`.

## API contracts
- Existing API surface remains:
  - `GET /api/providers/metadata`
  - `POST /api/providers/models`
  - `POST /api/sandbox/create`
  - `POST /api/sandbox/files/tree`
  - `POST /api/sandbox/files/read`
  - `POST /api/chat/stream`
- `GET /health` remains available for standalone backend local development.

## Edge cases / failure modes
- Missing `VITE_BACKEND_URL` on Vercel should not crash the frontend; it should use same-origin requests.
- SPA deep links should not return 404s.
- API routes must not be shadowed by the SPA rewrite.
- The backend must not call `app.listen()` when imported by the Vercel function entrypoint.

## Acceptance criteria
- Root Vercel deployment serves the frontend instead of the Vercel crash page.
- API requests are routable from the deployed frontend to the backend function.
- Local frontend and backend still run successfully with the exposed preview URLs.
- Frontend and backend build/typecheck/lint commands pass.

## Test plan / test cases
- Run local frontend and backend dev servers and confirm the backend health endpoint responds.
- Build the frontend and backend successfully from the monorepo.
- Verify the frontend no longer hard-fails when `VITE_BACKEND_URL` is unset in a same-origin deployment scenario.
- Review Vercel config to confirm API rewrite precedence before SPA rewrite.

## Implementation notes
- Follow Vercel Express guidance by exporting the Express app and adding a dedicated `api/` entrypoint.
- Use repo-root `vercel.json` to define install/build/output/rewrites for the monorepo.
- Prefer minimal code movement and no contract-breaking API changes.

## Status / open questions
- Status: done
- Open questions: none. The repo now contains a self-contained root deployment setup for Vercel.