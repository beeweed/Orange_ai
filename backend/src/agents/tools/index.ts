import type { StructuredToolResult } from '../../types'
import { executeFileRead, fileReadTool, type FileReadArgs } from './file_read'
import { executeFileWrite, fileWriteTool, type FileWriteArgs } from './file_write'
import { serializeToolResult, type ToolContext } from './shared'

export const agentTools = [fileReadTool, fileWriteTool] as const

export async function executeToolCall(
  name: string,
  rawArgs: string,
  context: ToolContext,
): Promise<{ result: StructuredToolResult; serialized: string }> {
  let parsedArgs: unknown

  try {
    parsedArgs = rawArgs ? JSON.parse(rawArgs) : {}
  } catch {
    const result: StructuredToolResult = {
      ok: false,
      operation: name,
      file_path: '/home/user/',
      message: 'Tool arguments were not valid JSON.',
      error: {
        code: 'INVALID_TOOL_ARGUMENTS',
        message: rawArgs,
      },
    }

    return { result, serialized: serializeToolResult(result) }
  }

  let result: StructuredToolResult

  switch (name) {
    case 'file_read':
      result = await executeFileRead(parsedArgs as FileReadArgs, context)
      break
    case 'file_write':
      result = await executeFileWrite(parsedArgs as FileWriteArgs, context)
      break
    default:
      result = {
        ok: false,
        operation: name,
        file_path: '/home/user/',
        message: 'Unknown tool requested.',
        error: {
          code: 'UNKNOWN_TOOL',
          message: name,
        },
      }
      break
  }

  return { result, serialized: serializeToolResult(result) }
}
