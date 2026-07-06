import { MessageSquare, PanelLeftClose, PanelLeftOpen, Plus, Trash2 } from 'lucide-react'
import clsx from 'clsx'
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
    <aside className={clsx('history-sidebar', !open && 'collapsed')}>
      <div className="history-topbar">
        <button className="icon-btn" onClick={onToggle} aria-label="Toggle chat history">
          {open ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </button>
        {open ? (
          <button className="history-new" onClick={onCreate}>
            <Plus size={14} /> New chat
          </button>
        ) : (
          <button className="icon-btn" onClick={onCreate} aria-label="Create chat">
            <Plus size={16} />
          </button>
        )}
      </div>

      {open && (
        <div className="history-list">
          {chats.map((chat) => (
            <button
              key={chat.id}
              className={clsx('history-item', chat.id === activeChatId && 'active')}
              onClick={() => onSelect(chat.id)}
            >
              <span className="history-item-main">
                <MessageSquare size={14} />
                <span className="history-item-copy">
                  <span className="history-item-title">{chat.title}</span>
                  <span className="history-item-meta">
                    {new Date(chat.updatedAt).toLocaleDateString()}
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
              >
                <Trash2 size={13} />
              </span>
            </button>
          ))}
        </div>
      )}
    </aside>
  )
}
