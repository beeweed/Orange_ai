import clsx from 'clsx'
import { Clock3, MessageSquare, PanelLeftClose, PanelLeftOpen, Plus, Trash2 } from 'lucide-react'
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

export function ChatHistorySidebar({
  open,
  chats,
  activeChatId,
  onToggle,
  onCreate,
  onSelect,
  onDelete,
}: Props) {
  return (
    <aside className={clsx('history-sidebar', !open && 'collapsed')} aria-label="Chat history sidebar">
      <div className="history-topbar">
        <button className="icon-btn" onClick={onToggle} aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}>
          {open ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </button>

        {open ? (
          <button className="history-new" onClick={onCreate}>
            <Plus size={15} />
            <span>New chat</span>
          </button>
        ) : (
          <button className="icon-btn" onClick={onCreate} aria-label="Create chat">
            <Plus size={16} />
          </button>
        )}
      </div>

      {open ? (
        <>
          <div className="history-brand-card">
            <div className="brand-badge">A</div>
            <div className="history-brand-copy">
              <strong>Orange AI</strong>
              <span>Redesigned coding agent workspace</span>
            </div>
          </div>

          <div className="history-section-label">Recent threads</div>

          <div className="history-list">
            {chats.map((chat) => {
              const active = chat.id === activeChatId

              return (
                <button
                  key={chat.id}
                  className={clsx('history-item', active && 'active')}
                  onClick={() => onSelect(chat.id)}
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
        </>
      ) : (
        <div className="history-collapsed-list">
          {chats.slice(0, 6).map((chat) => (
            <button
              key={chat.id}
              className={clsx('history-collapsed-item', chat.id === activeChatId && 'active')}
              onClick={() => onSelect(chat.id)}
              aria-label={chat.title}
              title={chat.title}
            >
              <MessageSquare size={15} />
            </button>
          ))}
        </div>
      )}
    </aside>
  )
}