import type { ChatThread, FileNode } from '../types/app'

export function makeId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`
}

export function firstMessageTitle(message: string): string {
  const cleaned = message.replace(/\s+/g, ' ').trim()
  if (!cleaned) return 'New chat'
  return cleaned.length > 42 ? `${cleaned.slice(0, 42)}…` : cleaned
}

export function createEmptyChat(): ChatThread {
  const timestamp = new Date().toISOString()
  return {
    id: makeId('chat'),
    title: 'New chat',
    createdAt: timestamp,
    updatedAt: timestamp,
    messages: [],
    transcript: [],
    fileTree: [],
  }
}

export function fileTypeClass(file?: FileNode): string {
  if (!file || file.type === 'dir') return 'folder'

  const extension = file.extension ?? ''
  if (['ts', 'tsx', 'js', 'jsx'].includes(extension)) return 'ts'
  if (['py'].includes(extension)) return 'py'
  if (['css', 'scss'].includes(extension)) return 'css'
  if (['json'].includes(extension)) return 'json'
  return 'file'
}
