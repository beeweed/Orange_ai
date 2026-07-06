import { Sandbox } from 'e2b'
import path from 'node:path'
import type { EntryInfo } from 'e2b'
import type { FileNode, SandboxConfigInput, SandboxSessionSummary } from './types'

const DEFAULT_TIMEOUT_MS = 60 * 60 * 1000
const ROOT_PATH = '/home/user'

function sortEntries(entries: EntryInfo[]): EntryInfo[] {
  return [...entries].sort((left, right) => {
    const leftType = left.type === 'dir' ? 0 : 1
    const rightType = right.type === 'dir' ? 0 : 1

    if (leftType !== rightType) {
      return leftType - rightType
    }

    return left.name.localeCompare(right.name)
  })
}

function extensionFor(nodePath: string): string | undefined {
  const extension = path.extname(nodePath)
  return extension ? extension.slice(1).toLowerCase() : undefined
}

export async function createSandboxSession(
  config: SandboxConfigInput,
): Promise<{ sandbox: Sandbox; session: SandboxSessionSummary }> {
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const sandbox = config.templateId
    ? await Sandbox.create(config.templateId, { apiKey: config.apiKey, timeoutMs })
    : await Sandbox.create({ apiKey: config.apiKey, timeoutMs })

  return {
    sandbox,
    session: {
      sandboxId: sandbox.sandboxId,
      templateId: config.templateId,
      createdAt: new Date().toISOString(),
    },
  }
}

export async function connectSandboxSession(config: SandboxConfigInput): Promise<Sandbox> {
  if (!config.sandboxId) {
    throw new Error('sandboxId is required to connect to a sandbox session.')
  }

  return Sandbox.connect(config.sandboxId, {
    apiKey: config.apiKey,
    timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  })
}

export async function getOrCreateSandbox(
  config: SandboxConfigInput,
): Promise<{ sandbox: Sandbox; session: SandboxSessionSummary; created: boolean }> {
  if (config.sandboxId) {
    const sandbox = await connectSandboxSession(config)
    return {
      sandbox,
      created: false,
      session: {
        sandboxId: sandbox.sandboxId,
        templateId: config.templateId,
        createdAt: new Date().toISOString(),
      },
    }
  }

  const created = await createSandboxSession(config)
  return { ...created, created: true }
}

export async function buildFileTree(
  sandbox: Sandbox,
  currentPath = ROOT_PATH,
): Promise<FileNode[]> {
  const entries = await sandbox.files.list(currentPath)
  const ordered = sortEntries(entries)

  return Promise.all(
    ordered.map(async (entry) => {
      const node: FileNode = {
        name: entry.name,
        path: entry.path,
        type: entry.type === 'dir' ? 'dir' : 'file',
        extension: entry.type === 'dir' ? undefined : extensionFor(entry.path),
      }

      if (entry.type === 'dir') {
        try {
          node.children = await buildFileTree(sandbox, entry.path)
        } catch {
          node.children = []
        }
      }

      return node
    }),
  )
}

export async function readPreviewFile(sandbox: Sandbox, filePath: string): Promise<string> {
  return sandbox.files.read(filePath)
}
