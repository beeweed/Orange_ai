const configuredBackendUrl = (import.meta.env.VITE_BACKEND_URL ?? '').trim()
const fallbackOrigin = typeof window !== 'undefined' ? window.location.origin : ''

const resolvedBaseUrl = (configuredBackendUrl || fallbackOrigin)
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '')

export const BACKEND_URL = resolvedBaseUrl