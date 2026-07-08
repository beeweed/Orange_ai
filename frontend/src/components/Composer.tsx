import { ChevronDown, Cpu, LoaderCircle, Send, Server, Square, TriangleAlert } from 'lucide-react'
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
  const provider = providers[selectedProvider]
  const models = provider.models
  const sendDisabled = runtime.isStreaming || !value.trim()
  const showIteration = runtime.isStreaming || runtime.iteration > 0

  return (
    <footer className="composer" data-design-id="chat-input-area">
      {showIteration ? (
        <div className="iteration-bar">
          <div className="iteration-pill">
            <span className="live-dot" />
            <span className="iteration-label">
              <strong>{runtime.iteration}</strong>
              <span className="iteration-sep">/</span>
              {runtime.maxIterations}
            </span>
          </div>
          {runtime.isStreaming ? (
            <button className="stop-btn" onClick={onStop}>
              <Square size={12} />
              Stop
            </button>
          ) : null}
        </div>
      ) : null}

      {!readyToChat && !runtime.isStreaming ? (
        <button className="setup-hint" onClick={() => console.log('open settings')}>
          <TriangleAlert size={14} />
          <span>Configure settings to start</span>
          <ChevronDown size={14} className="hint-chevron" />
        </button>
      ) : null}

      <div className="prompt-card">
        <textarea
          className="prompt-field"
          aria-label="Chat input"
          placeholder={
            readyToChat
              ? 'How can I help you build today?'
              : 'Add your API key and model in Settings to start …'
          }
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              onSend()
            }
          }}
          disabled={runtime.isStreaming}
        />

        <div className="prompt-toolbar">
          <div className="toolbar-left">
            <label className="pill-select" aria-label="Provider">
              <span className="pill-icon">
                <Server size={13} />
              </span>
              <select
                value={selectedProvider}
                onChange={(event) => onProviderChange(event.target.value as ProviderId)}
                disabled={runtime.isStreaming}
              >
                {Object.entries(providerMeta).map(([providerId, meta]) => (
                  <option key={providerId} value={providerId}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="pill-select" aria-label="Model">
              <span className="pill-icon">
                <Cpu size={13} />
              </span>
              <select
                value={selectedModel}
                onChange={(event) => onModelChange(event.target.value)}
                disabled={runtime.isStreaming || provider.status === 'loading'}
              >
                <option value="">Select model</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            className="prompt-send"
            data-design-id="send-btn"
            aria-label="Send message"
            disabled={sendDisabled}
            onClick={onSend}
            title="Send message"
          >
            <Send size={16} />
          </button>
        </div>

        <div className="prompt-meta">
          {showIteration ? (
            <span className="meta-pill">{providerMeta[selectedProvider]?.label ?? selectedProvider}</span>
          ) : null}
          <span className="meta-status">
            {provider.status === 'loading' ? (
              <>
                <LoaderCircle size={12} className="spin" />
                Loading models…
              </>
            ) : provider.status === 'error' ? (
              provider.error || 'Model loading failed.'
            ) : selectedModel ? (
              selectedModel
            ) : (
              'Choose a model to continue.'
            )}
          </span>
        </div>
      </div>
    </footer>
  )
}
