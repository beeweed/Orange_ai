const backendUrl = import.meta.env.VITE_BACKEND_URL

if (!backendUrl) {
  throw new Error('VITE_BACKEND_URL is missing. Add it to frontend/.env.')
}

export const BACKEND_URL = backendUrl.replace(/\/$/, '')
