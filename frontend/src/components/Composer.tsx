import { ChevronDown, Send, Square } from 'lucide-react'
import type { ProviderId, ProviderMeta, ProviderState, RuntimeState } from '../types/app'

type Props = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onStop: () => void
  runtime: RuntimeState
  providers: Record<ProviderId, ProviderState>
  providerMeta: Record<ProviderId, ProviderMeta>
  selectedProvider: ProviderId
  selectedModel: string
  onProviderChange: (provider: ProviderId) => void
  onModelChange: (model: string) => void
  readyToChat: boolean
}

export function Composer({
  value,
  onChange,
  onSend,
  onStop,
  runtime,
  providers,
  providerMeta,
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
  readyToChat,
}: Props) {
  const models = providers[selectedProvider].models

  return (
    <footer className="composer" data-design-id="chat-input-area">
      <div className="iteration-row">
        <div className="iteration-pill">
          <span className="live-dot" />
          Iteration {runtime.iteration}/{runtime.maxIterations}
        </div>
        {runtime.isStreaming ? (
          <button className="stop-btn" onClick={onStop}>
            <Square size={12} /> Stop
          </button>
        ) : null}
      </div>

      {!readyToChat ? (
        <div className="warning-banner" data-design-id="api-key-warning">
          Configure a provider API key, select a model, and add an E2B API key in Settings to start chatting.
        </div>
      ) : null}

      <div className="input-card" data-design-id="input-area">
        <textarea
          className="input-field"
          aria-label="Chat input"
          placeholder="Ask the agent to read, create, or overwrite sandbox files…"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              onSend()
            }
          }}
        />
        <div className="composer-actions stacked-on-mobile">
          <div className="model-stack">
            <label className="select-shell compact-select">
              <span className="model-icon">P</span>
              <select value={selectedProvider} onChange={(event) => onProviderChange(event.target.value as ProviderId)}>
                {Object.entries(providerMeta).map(([provider, meta]) => (
                  <option key={provider} value={provider}>
                    {meta.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} />
            </label>
            <label className="select-shell model-select">
              <span className="model-icon">M</span>
              <select value={selectedModel} onChange={(event) => onModelChange(event.target.value)}>
                <option value="">Select model</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} />
            </label>
          </div>
          <button
            className="send-btn"
            data-design-id="send-btn"
            aria-label="Send message"
            disabled={!readyToChat || runtime.isStreaming || !value.trim()}
            onClick={onSend}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </footer>
  )
}
