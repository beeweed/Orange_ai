import { FilePlus2, FileText } from 'lucide-react'
import type { RuntimeState, UiMessage } from '../types/app'

type Props = {
  messages: UiMessage[]
  runtime: RuntimeState
}

export function ChatMessages({ messages, runtime }: Props) {
  return (
    <div className="messages">
      <div className="messages-stack">
        {messages.length === 0 ? (
          <div className="assistant-block welcome-block">
            <div className="assistant-head">
              <div className="assistant-name">
                <span className="purple">Anygent</span> <span className="muted">AI</span>
              </div>
            </div>
            <div className="assistant-copy">
              <p>
                Configure a model provider and your E2B sandbox key, then ask the agent to inspect,
                create, or overwrite files inside the sandbox.
              </p>
            </div>
          </div>
        ) : null}

        {messages.map((message) =>
          message.role === 'user' ? (
            <div key={message.id} className="message-row">
              <div className="user-avatar">U</div>
              <div className="user-bubble">{message.content}</div>
            </div>
          ) : (
            <div key={message.id} className="assistant-block">
              <div className="assistant-head">
                <div className="assistant-name">
                  <span className="purple">Anygent</span> <span className="muted">AI</span>
                </div>
              </div>
              <div className="assistant-copy preserve-whitespace">{message.content || (message.streaming ? '' : ' ')}</div>
              {message.toolChips.length > 0 ? (
                <div className="tool-chip-row">
                  {message.toolChips.map((chip) => (
                    <div key={chip.id} className="tool-chip">
                      <span className="tool-icon">
                        {chip.kind === 'create' ? <FilePlus2 size={13} /> : <FileText size={13} />}
                      </span>
                      <span>
                        {chip.label} {chip.success === false ? <small>failed</small> : null}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ),
        )}

        {runtime.isStreaming ? (
          <section className="thinking" data-design-id="thinking-indicator">
            <div className="thinking-line shiny-copy">
              <span style={{ color: '#ffc700' }}>Anygent</span> {runtime.statusLabel || 'Thinking...'}
              <span className="thinking-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
