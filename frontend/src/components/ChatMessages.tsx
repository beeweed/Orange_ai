import { AlertTriangle, ChevronDown, FilePlus2, FileText, Settings2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { RuntimeState, UiMessage } from '../types/app'

type Props = {
  messages: UiMessage[]
  runtime: RuntimeState
  onOpenSettings?: () => void
}

function renderAssistantCopy(content: string) {
  return content.split(/\n{2,}/).map((paragraph, index) => (
    <p key={`${index}_${paragraph.slice(0, 16)}`}>{paragraph || ' '}</p>
  ))
}

export function ChatMessages({ messages, runtime, onOpenSettings }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isScrolledUp, setIsScrolledUp] = useState(false)

  const scrollToBottom = useCallback(() => {
    const container = scrollRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
      setIsScrolledUp(false)
    }
  }, [])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
      setIsScrolledUp(distanceFromBottom > 100)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isScrolledUp && messages.length > 0) {
      scrollToBottom()
    }
  }, [messages, isScrolledUp, scrollToBottom])

  return (
    <div className="messages" ref={scrollRef}>
      <div className="messages-stack">
        {messages.length === 0 ? (
          <div className="assistant-block welcome-block">
            <div className="assistant-head">
              <div className="assistant-name">
                <span className="purple">Orange</span> <span className="muted">AI</span>
              </div>
            </div>
            <div className="assistant-copy">
              <p>Configure a provider and sandbox key, then ask the agent to inspect, create, or overwrite files.</p>
            </div>

            <div className="quick-actions">
              <button className="quick-action-card" onClick={onOpenSettings}>
                <span className="quick-action-icon">
                  <Settings2 size={16} />
                </span>
                <span className="quick-action-text">
                  <strong>Configure provider</strong>
                  <small>Add API keys and select a model</small>
                </span>
              </button>
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

        {isScrolledUp ? (
          <button className="scroll-bottom-btn" onClick={scrollToBottom} aria-label="Scroll to bottom">
            <ChevronDown size={16} />
          </button>
        ) : null}
      </div>
    </div>
  )
}