import OpenAI from 'openai'
import { z } from 'zod'
import type { ProviderConfig, ProviderId, ProviderModel } from '../../types'

const providerIdSchema = z.enum(['openrouter', 'groq', 'nvidia'])

export const providerMetadata: Record<
  ProviderId,
  { label: string; defaultBaseUrl: string; docsUrl: string }
> = {
  openrouter: {
    label: 'OpenRouter',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    docsUrl: 'https://openrouter.ai/docs/quickstart',
  },
  groq: {
    label: 'Groq',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    docsUrl: 'https://console.groq.com/docs/openai',
  },
  nvidia: {
    label: 'NVIDIA NIM',
    defaultBaseUrl: 'https://integrate.api.nvidia.com/v1',
    docsUrl: 'https://docs.api.nvidia.com/nim/reference/llm-apis',
  },
}

export function assertProvider(provider: string): ProviderId {
  return providerIdSchema.parse(provider)
}

export function resolveBaseUrl(config: ProviderConfig): string {
  return config.baseUrl?.trim() || providerMetadata[config.provider].defaultBaseUrl
}

export function createProviderClient(config: ProviderConfig): OpenAI {
  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: resolveBaseUrl(config),
  })
}

function normalizeModel(raw: Record<string, unknown>): ProviderModel {
  const id = String(raw.id ?? raw.name ?? 'unknown-model')
  const supportedParameters = Array.isArray(raw.supported_parameters)
    ? raw.supported_parameters.map((item) => String(item))
    : []

  return {
    id,
    name: String(raw.name ?? id),
    description: typeof raw.description === 'string' ? raw.description : undefined,
    contextWindow:
      typeof raw.context_length === 'number'
        ? raw.context_length
        : typeof raw.top_provider === 'object' && raw.top_provider && typeof (raw.top_provider as Record<string, unknown>).context_length === 'number'
          ? ((raw.top_provider as Record<string, number>).context_length)
          : undefined,
    supportsTools: supportedParameters.includes('tools'),
  }
}

export async function listProviderModels(config: ProviderConfig): Promise<ProviderModel[]> {
  const baseUrl = resolveBaseUrl(config)
  const response = await fetch(`${baseUrl}/models`, {
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Provider model request failed with ${response.status} ${response.statusText}`)
  }

  const payload = (await response.json()) as { data?: Record<string, unknown>[] }
  const models = Array.isArray(payload.data) ? payload.data : []

  return models.map(normalizeModel).sort((a, b) => a.name.localeCompare(b.name))
}
