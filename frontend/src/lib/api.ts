import { BACKEND_URL } from './env'
import type { FileNode, ProviderId, ProviderMeta, ProviderModel } from '../types/app'

export async function fetchProviderMetadata(): Promise<Record<ProviderId, ProviderMeta>> {
  const response = await fetch(`${BACKEND_URL}/api/providers/metadata`)
  if (!response.ok) {
    throw new Error('Failed to load provider metadata.')
  }

  const payload = (await response.json()) as { providers: Record<ProviderId, ProviderMeta> }
  return payload.providers
}

export async function fetchProviderModels(input: {
  provider: ProviderId
  apiKey: string
  baseUrl?: string
}): Promise<ProviderModel[]> {
  const response = await fetch(`${BACKEND_URL}/api/providers/models`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Failed to fetch models.')
  }

  const payload = (await response.json()) as { models: ProviderModel[] }
  return payload.models
}

export async function fetchFileTree(input: {
  sandboxId: string
  apiKey: string
  path?: string
}): Promise<FileNode[]> {
  const response = await fetch(`${BACKEND_URL}/api/sandbox/files/tree`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error('Failed to load sandbox files.')
  }

  const payload = (await response.json()) as { tree: FileNode[] }
  return payload.tree
}

export async function fetchFilePreview(input: {
  sandboxId: string
  apiKey: string
  filePath: string
}): Promise<{ exists: boolean; content: string }> {
  const response = await fetch(`${BACKEND_URL}/api/sandbox/files/read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error('Failed to load file preview.')
  }

  return (await response.json()) as { exists: boolean; content: string }
}
