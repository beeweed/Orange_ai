import { ExternalLink, KeyRound, X } from 'lucide-react'
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
  if (!open) return null

  return (
    <div className="overlay show" id="settings-overlay">
      <div className="overlay-backdrop" onClick={onClose} />
      <div className="settings-modal" data-design-id="settings-dialog">
        <div className="modal-head">
          <div className="modal-icon">
            <KeyRound size={18} />
          </div>
          <div>
            <div className="modal-title">Settings</div>
            <div className="modal-subtitle">Configure LLM providers and E2B sandbox access</div>
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
                    <KeyRound size={16} />
                  </div>
                  <div>
                    <div className="provider-name">{meta.label}</div>
                    <div className="provider-desc">OpenAI-compatible provider adapter</div>
                  </div>
                </div>
                <a href={meta.docsUrl} target="_blank" rel="noreferrer" className="helper-link inline-link">
                  Docs <ExternalLink size={12} />
                </a>
              </div>
              <div className="input-wrap stacked-inputs">
                <input
                  type="password"
                  className="token-input"
                  placeholder="API key"
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
                  <span>{config.status === 'error' ? config.error || 'Error' : config.status}</span>
                </div>
              </div>
            </div>
          )
        })}

        <div className="field-group">
          <label className="field-label">E2B Sandbox</label>
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
          The app stores chats and settings in your browser localStorage only. The backend uses your provided keys per request.
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
