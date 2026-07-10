import express from 'express'
import cors from 'cors'
import pinoHttp from 'pino-http'
import { z } from 'zod'
import { env } from './config'
import { logger } from './logger'
import { assertProvider, listProviderModels, providerMetadata } from './agents/providers'
import { streamChatRun } from './agents/runtime'
import { buildFileTree, connectSandboxSession, createSandboxSession, readPreviewFile } from './sandbox-service'
import type { ChatStreamRequest } from './types'

const app = express()

app.use(cors({ origin: env.FRONTEND_ORIGIN === '*' ? true : env.FRONTEND_ORIGIN }))
app.use(express.json({ limit: '50mb' }))
app.use(
  pinoHttp({
    logger,
  }),
)

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/providers/metadata', (_req, res) => {
  res.json({ providers: providerMetadata })
})

app.post('/api/providers/models', async (req, res) => {
  const body = z
    .object({
      provider: z.string(),
      apiKey: z.string().min(1),
      baseUrl: z.string().url().optional(),
    })
    .parse(req.body)

  const provider = assertProvider(body.provider)
  const models = await listProviderModels({
    provider,
    apiKey: body.apiKey,
    baseUrl: body.baseUrl,
  })

  res.json({ models })
})

app.post('/api/sandbox/create', async (req, res) => {
  const body = z
    .object({
      apiKey: z.string().min(1),
      templateId: z.string().optional(),
    })
    .parse(req.body)

  const { session } = await createSandboxSession({
    apiKey: body.apiKey,
    templateId: body.templateId,
    timeoutMs: 60 * 60 * 1000,
  })

  res.json(session)
})

app.post('/api/sandbox/files/tree', async (req, res) => {
  const body = z
    .object({
      sandboxId: z.string().min(1),
      apiKey: z.string().min(1),
      path: z.string().default('/home/user'),
    })
    .parse(req.body)

  const sandbox = await connectSandboxSession({
    sandboxId: body.sandboxId,
    apiKey: body.apiKey,
    timeoutMs: 60 * 60 * 1000,
  })

  const tree = await buildFileTree(sandbox, body.path)
  res.json({ tree })
})

app.post('/api/sandbox/files/read', async (req, res) => {
  const body = z
    .object({
      sandboxId: z.string().min(1),
      apiKey: z.string().min(1),
      filePath: z.string().min(1),
    })
    .parse(req.body)

  const sandbox = await connectSandboxSession({
    sandboxId: body.sandboxId,
    apiKey: body.apiKey,
    timeoutMs: 60 * 60 * 1000,
  })

  const exists = await sandbox.files.exists(body.filePath)

  if (!exists) {
    res.json({ exists: false, content: '' })
    return
  }

  const content = await readPreviewFile(sandbox, body.filePath)
  res.json({ exists: true, content })
})

app.post('/api/chat/stream', async (req, res) => {
  const body = z
    .object({
      chatId: z.string().min(1),
      message: z.string().min(1),
      transcript: z.array(
        z.object({
          role: z.enum(['system', 'user', 'assistant', 'tool']),
          content: z.string(),
          tool_calls: z
            .array(
              z.object({
                id: z.string(),
                type: z.literal('function'),
                function: z.object({
                  name: z.string(),
                  arguments: z.string(),
                }),
              }),
            )
            .optional(),
          tool_call_id: z.string().optional(),
          name: z.string().optional(),
          timestamp: z.string(),
        }),
      ),
      provider: z.enum(['openrouter', 'groq', 'nvidia']),
      model: z.string().min(1),
      credentials: z.object({
        apiKey: z.string().min(1),
        baseUrl: z.string().url().optional(),
      }),
      sandbox: z.object({
        apiKey: z.string().min(1),
        sandboxId: z.string().optional(),
        templateId: z.string().optional(),
        timeoutMs: z.number().optional(),
      }),
    })
    .parse(req.body) as ChatStreamRequest

  res.status(200)
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()

  try {
    await streamChatRun(res, body)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    res.write(`event: error\ndata: ${JSON.stringify({ message, recoverable: true })}\n\n`)
  } finally {
    res.end()
  }
})

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(error)

  if (error instanceof z.ZodError) {
    res.status(400).json({
      error: 'Invalid request',
      details: error.flatten(),
    })
    return
  }

  res.status(500).json({
    error: error instanceof Error ? error.message : 'Internal server error',
  })
})

export default app
