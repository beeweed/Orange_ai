import clsx from 'clsx'
import { Clock3, MessageSquare, PanelLeftClose, Plus, Trash2 } from 'lucide-react'
import type { ChatThread } from '../types/app'

type Props = {
  open: boolean
  chats: ChatThread[]
  activeChatId: string | null
  onToggle: () => void
  onCreate: () => void
  onSelect: (chatId: string) => void
  onDelete: (chatId: string) => void
}

function formatTimestamp(value: string) {
  const date = new Date(value)
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function ChatHistorySidebar({ open, chats, activeChatId, onToggle, onCreate, onSelect, onDelete }: Props) {
  return (
    <aside
      className={clsx('history-sidebar', open && 'open')}
      aria-label="Chat history sidebar"
      aria-hidden={!open}
    >
      <div className="history-topbar">
        <button className="icon-btn" onClick={onToggle} aria-label="Close sidebar">
          <PanelLeftClose size={16} />
        </button>

        <button className="history-new" onClick={onCreate}>
          <Plus size={15} />
          <span>New chat</span>
        </button>
      </div>

      <div className="history-brand-card">
        <div className="brand-badge">A</div>
        <div className="history-brand-copy">
          <strong>Orange AI</strong>
          <span>Redesigned coding agent workspace</span>
        </div>
      </div>

      {chats.length > 0 ? <div className="history-section-label">Recent threads</div> : null}

      <div className="history-list">
        {chats.length === 0 ? (
          <div className="history-empty">No chats yet. Start a new conversation.</div>
        ) : null}
        {chats.map((chat) => {
          const active = chat.id === activeChatId

          return (
            <button
              key={chat.id}
              className={clsx('history-item', active && 'active')}
              onClick={async () => {
                await onSelect(chat.id)
                onToggle()
              }}
              aria-pressed={active}
            >
              <span className="history-item-main">
                <span className="history-item-icon">
                  <MessageSquare size={14} />
                </span>
                <span className="history-item-copy">
                  <span className="history-item-title">{chat.title}</span>
                  <span className="history-item-meta">
                    <Clock3 size={11} />
                    {formatTimestamp(chat.updatedAt)}
                  </span>
                </span>
              </span>

              <span
                className="history-delete"
                onClick={(event) => {
                  event.stopPropagation()
                  onDelete(chat.id)
                }}
                role="button"
                tabIndex={0}
                aria-label={`Delete ${chat.title}`}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    event.stopPropagation()
                    onDelete(chat.id)
                  }
                }}
              >
                <Trash2 size={13} />
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
