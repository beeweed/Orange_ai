import { ExternalLink, KeyRound, ServerCog, X } from 'lucide-react'
import { useEffect } from 'react'
import type { ProviderId, ProviderMeta, ProviderState } from '../types/app'

type Props = {
  open: boolean
  providerMeta: Record<ProviderId, ProviderMeta>
  providers: Record<ProviderId, ProviderState>
  e2bApiKey: string
  e2bTemplateId: string
  onClose: () => void
  onProviderFieldChange: (provider: ProviderId, field: 'apiKey' | 'baseUrl', value: string) => void
  onE2bApiKeyChange: (value: string) => void
  onE2bTemplateIdChange: (value: string) => void
  onSave: () => void
}

const providerDescriptions: Record<ProviderId, string> = {
  openrouter: 'Access multiple tool-capable models from one gateway.',
  groq: 'Fast OpenAI-compatible inference for supported models.',
  nvidia: 'Connect to NVIDIA NIM endpoints for hosted inference.',
}

function statusCopy(config: ProviderState) {
  if (config.status === 'error') return config.error || 'Unable to load models.'
  if (config.status === 'loading') return 'Loading available models…'
  if (config.status === 'ready') return `${config.models.length} model${config.models.length === 1 ? '' : 's'} available`
  return 'Idle until an API key is added'
}

export function SettingsModal({
  open,
  providerMeta,
  providers,
  e2bApiKey,
  e2bTemplateId,
  onClose,
  onProviderFieldChange,
  onE2bApiKeyChange,
  onE2bTemplateIdChange,
  onSave,
}: Props) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [onClose, open])

  if (!open) return null

  return (
    <div className="overlay show" id="settings-overlay">
      <div
        className="overlay-backdrop"
        onClick={onClose}
        role="presentation"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            onClose()
          }
        }}
      />

      <div className="settings-modal" data-design-id="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="modal-head">
          <div className="modal-icon">
            <KeyRound size={18} />
          </div>

          <div className="modal-title-wrap">
            <div className="modal-title" id="settings-title">
              Settings
            </div>
            <div className="modal-subtitle">Configure credentials, models, and sandbox access</div>
          </div>

          <button className="icon-btn" onClick={onClose} aria-label="Close settings">
            <X size={16} />
          </button>
        </div>

        {(['openrouter', 'groq', 'nvidia'] as ProviderId[]).map((provider) => {
          const meta = providerMeta[provider]
          const config = providers[provider]

          return (
            <div className="field-group" key={provider}>
              <label className="field-label">{meta.label}</label>

              <div className="provider-card stack-card">
                <div className="provider-meta">
                  <div className="ico">
                    <ServerCog size={16} />
                  </div>
                  <div>
                    <div className="provider-name">{meta.label}</div>
                    <div className="provider-desc">{providerDescriptions[provider]}</div>
                  </div>
                </div>

                <a href={meta.docsUrl} target="_blank" rel="noreferrer" className="helper-link inline-link">
                  Docs
                  <ExternalLink size={12} />
                </a>
              </div>

              <div className="input-wrap stacked-inputs">
                <input
                  type="password"
                  className="token-input"
                  placeholder={`${meta.label} API key`}
                  value={config.apiKey}
                  onChange={(event) => onProviderFieldChange(provider, 'apiKey', event.target.value)}
                />
                <input
                  type="text"
                  className="token-input secondary-input"
                  placeholder="Base URL"
                  value={config.baseUrl}
                  onChange={(event) => onProviderFieldChange(provider, 'baseUrl', event.target.value)}
                />
                <div className="provider-status-line">
                  <span className={`status-dot ${config.status}`} />
                  <span>{statusCopy(config)}</span>
                </div>
              </div>
            </div>
          )
        })}

        <div className="field-group">
          <label className="field-label">E2B Sandbox</label>
          <div className="provider-card stack-card inline-card-muted">
            <div className="provider-meta">
              <div className="ico sand">
                <KeyRound size={16} />
              </div>
              <div>
                <div className="provider-name">Sandbox credentials</div>
                <div className="provider-desc">Required for file reads, file writes, and live workspace previews.</div>
              </div>
            </div>
          </div>
          <div className="input-wrap stacked-inputs">
            <input
              type="password"
              className="token-input"
              placeholder="E2B API key"
              value={e2bApiKey}
              onChange={(event) => onE2bApiKeyChange(event.target.value)}
            />
            <input
              type="text"
              className="token-input secondary-input"
              placeholder="Optional custom template ID"
              value={e2bTemplateId}
              onChange={(event) => onE2bTemplateIdChange(event.target.value)}
            />
          </div>
        </div>

        <div className="warn-inline">
          The app stores chats and settings in browser localStorage only. Provider and E2B keys are sent to the backend per request and are not bundled into the frontend.
        </div>

        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={onSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}