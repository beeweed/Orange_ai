import { Folder, MessageSquareText } from 'lucide-react'

type Props = {
  activeTab: 'chat' | 'files'
  onChange: (tab: 'chat' | 'files') => void
}

export function MobileTabBar({ activeTab, onChange }: Props) {
  return (
    <nav className="mobile-tabbar" data-design-id="mobile-tab-bar">
      <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => onChange('chat')}>
        <MessageSquareText size={16} />
        <span>Chat</span>
      </button>
      <button className={activeTab === 'files' ? 'active' : ''} onClick={() => onChange('files')}>
        <Folder size={16} />
        <span>Files</span>
      </button>
    </nav>
  )
}
