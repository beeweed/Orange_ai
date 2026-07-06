import type { StructuredToolResult } from '../../types'
import { assertSandboxPath, withLineNumbers } from './shared'
import type { ToolContext } from './shared'

export const fileReadTool = {
  type: 'function',
  function: {
    name: 'file_read',
    description: 'Read the content of an existing file from the sandbox. Returns content with line numbers.',
    parameters: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Absolute path starting with /home/user/. Example: /home/user/project/src/main.py'
        }
      },
      required: ['file_path']
    }
  }
} as const

export type FileReadArgs = {
  file_path: string
}

export async function executeFileRead(
  args: FileReadArgs,
  context: ToolContext,
): Promise<StructuredToolResult> {
  assertSandboxPath(args.file_path)

  const exists = await context.sandbox.files.exists(args.file_path)

  if (!exists) {
    return {
      ok: false,
      operation: 'file_read',
      file_path: args.file_path,
      message: 'File does not exist.',
      error: {
        code: 'FILE_NOT_FOUND',
        message: `No file exists at ${args.file_path}`,
      },
    }
  }

  const content = await context.sandbox.files.read(args.file_path)

  return {
    ok: true,
    operation: 'file_read',
    file_path: args.file_path,
    message: 'File read successfully.',
    content_with_line_numbers: withLineNumbers(content),
    bytes: Buffer.byteLength(content, 'utf8'),
  }
}
