import clsx from 'clsx'
import { RotateCcw, Settings2 } from 'lucide-react'

type Props = {
  title: string
  onReset: () => void
  onOpenSettings: () => void
  attention?: boolean
}

export function HeaderBar({ title, onReset, onOpenSettings, attention }: Props) {
  return (
    <header className="chat-header" data-design-id="chat-header">
      <div className="brand">
        <div className="brand-badge">A</div>
        <div className="brand-copy">
          <div className="brand-title">{title}</div>
          <div className="brand-subtitle">Orange AI coding workspace</div>
        </div>
      </div>

      <div className="icon-actions">
        <button className="icon-btn" aria-label="Reset conversation" onClick={onReset}>
          <RotateCcw size={16} />
        </button>
        <button
          className={clsx('icon-btn', attention && 'pulse')}
          aria-label="Open settings"
          onClick={onOpenSettings}
        >
          <Settings2 size={16} />
        </button>
      </div>
    </header>
  )
}