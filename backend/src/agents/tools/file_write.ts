import type { StructuredToolResult } from '../../types'
import { assertSandboxPath } from './shared'
import type { ToolContext } from './shared'

export const fileWriteTool = {
  type: 'function',
  function: {
    name: 'file_write',
    description: 'Create or overwrite a file at the given path inside the sandbox. Use for creating new files or fully rewriting existing ones.',
    parameters: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Absolute path starting with /home/user/. Example: /home/user/project/src/App.tsx'
        },
        content: {
          type: 'string',
          description: 'The full content to write to the file.'
        }
      },
      required: ['file_path', 'content']
    }
  }
} as const

export type FileWriteArgs = {
  file_path: string
  content: string
}

export async function executeFileWrite(
  args: FileWriteArgs,
  context: ToolContext,
): Promise<StructuredToolResult> {
  assertSandboxPath(args.file_path)

  await context.sandbox.files.write(args.file_path, args.content)

  return {
    ok: true,
    operation: 'file_write',
    file_path: args.file_path,
    message: 'File created or overwritten successfully.',
    bytes: Buffer.byteLength(args.content, 'utf8'),
  }
}
