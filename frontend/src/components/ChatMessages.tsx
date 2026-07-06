import { AlertTriangle, FilePlus2, FileText } from 'lucide-react'
import type { RuntimeState, UiMessage } from '../types/app'

type Props = {
  messages: UiMessage[]
  runtime: RuntimeState
}

function renderAssistantCopy(content: string) {
  return content.split(/\n{2,}/).map((paragraph, index) => (
    <p key={`${index}_${paragraph.slice(0, 16)}`}>{paragraph || ' '}</p>
  ))
}

export function ChatMessages({ messages, runtime }: Props) {
  return (
    <div className="messages">
      <div className="messages-stack">
        {messages.length === 0 ? (
          <div className="assistant-block welcome-block">
            <div className="assistant-head">
              <div className="assistant-name">
                <span className="purple">Orange</span> <span className="muted">AI</span>
              </div>
            </div>
            <div className="assistant-copy">
              <p>
                Configure a provider key, select a model, add your E2B sandbox key, then ask the agent to inspect,
                create, or overwrite files in the live workspace.
              </p>
              <p>
                The redesigned shell keeps chats, file previews, sandbox status, and settings in one responsive coding
                environment.
              </p>
            </div>
          </div>
        ) : null}

        {messages.map((message) =>
          message.role === 'user' ? (
            <div key={message.id} className="message-row">
              <div className="user-avatar">U</div>
              <div className="user-bubble preserve-whitespace">{message.content}</div>
            </div>
          ) : (
            <div key={message.id} className="assistant-block">
              <div className="assistant-head">
                <div className="assistant-name">
                  <span className="purple">Orange</span> <span className="muted">AI</span>
                </div>
              </div>

              <div className="assistant-copy preserve-whitespace">
                {message.content ? renderAssistantCopy(message.content) : message.streaming ? null : <p> </p>}
              </div>

              {message.toolChips.length > 0 ? (
                <div className="tool-chip-row">
                  {message.toolChips.map((chip) => (
                    <div
                      key={chip.id}
                      className={`tool-chip ${chip.success === false ? 'failed' : ''} ${chip.success === true ? 'success' : ''}`}
                    >
                      <span className="tool-icon">
                        {chip.kind === 'create' ? <FilePlus2 size={13} /> : <FileText size={13} />}
                      </span>
                      <span>
                        {chip.label}
                        {chip.success === false ? <small>failed</small> : null}
                        {chip.success === true ? <small>done</small> : null}
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
            <div className="thinking-line">
              <span className="thinking-brand">Orange</span>
              {runtime.statusLabel || 'Thinking'}
              <span className="thinking-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </div>
          </section>
        ) : null}

        {runtime.statusPhase === 'error' && runtime.error ? (
          <div className="warning-banner runtime-error">
            <AlertTriangle size={16} />
            {runtime.error}
          </div>
        ) : null}
      </div>
    </div>
  )
}