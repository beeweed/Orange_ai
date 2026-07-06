import type { Sandbox } from 'e2b'
import type { StructuredToolResult } from '../../types'

export type ToolContext = {
  sandbox: Sandbox
}

export function assertSandboxPath(filePath: string): void {
  if (!filePath.startsWith('/home/user/')) {
    throw new Error('Only absolute sandbox paths starting with /home/user/ are allowed.')
  }
}

export function withLineNumbers(content: string): string {
  const lines = content.split(/\r?\n/)
  return lines
    .map((line, index) => `${String(index + 1).padStart(6, ' ')}\t${line}`)
    .join('\n')
}

export function serializeToolResult(result: StructuredToolResult): string {
  return JSON.stringify(result)
}
