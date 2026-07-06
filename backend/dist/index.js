"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pino_http_1 = __importDefault(require("pino-http"));
const zod_1 = require("zod");
const config_1 = require("./config");
const logger_1 = require("./logger");
const providers_1 = require("./agents/providers");
const runtime_1 = require("./agents/runtime");
const sandbox_service_1 = require("./sandbox-service");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: config_1.env.FRONTEND_ORIGIN === '*' ? true : config_1.env.FRONTEND_ORIGIN }));
app.use(express_1.default.json({ limit: '50mb' }));
app.use((0, pino_http_1.default)({
    logger: logger_1.logger,
}));
app.get('/health', (_req, res) => {
    res.json({ ok: true });
});
app.get('/api/providers/metadata', (_req, res) => {
    res.json({ providers: providers_1.providerMetadata });
});
app.post('/api/providers/models', async (req, res) => {
    const body = zod_1.z
        .object({
        provider: zod_1.z.string(),
        apiKey: zod_1.z.string().min(1),
        baseUrl: zod_1.z.string().url().optional(),
    })
        .parse(req.body);
    const provider = (0, providers_1.assertProvider)(body.provider);
    const models = await (0, providers_1.listProviderModels)({
        provider,
        apiKey: body.apiKey,
        baseUrl: body.baseUrl,
    });
    res.json({ models });
});
app.post('/api/sandbox/create', async (req, res) => {
    const body = zod_1.z
        .object({
        apiKey: zod_1.z.string().min(1),
        templateId: zod_1.z.string().optional(),
    })
        .parse(req.body);
    const { session } = await (0, sandbox_service_1.createSandboxSession)({
        apiKey: body.apiKey,
        templateId: body.templateId,
        timeoutMs: 60 * 60 * 1000,
    });
    res.json(session);
});
app.post('/api/sandbox/files/tree', async (req, res) => {
    const body = zod_1.z
        .object({
        sandboxId: zod_1.z.string().min(1),
        apiKey: zod_1.z.string().min(1),
        path: zod_1.z.string().default('/home/user'),
    })
        .parse(req.body);
    const sandbox = await (0, sandbox_service_1.connectSandboxSession)({
        sandboxId: body.sandboxId,
        apiKey: body.apiKey,
        timeoutMs: 60 * 60 * 1000,
    });
    const tree = await (0, sandbox_service_1.buildFileTree)(sandbox, body.path);
    res.json({ tree });
});
app.post('/api/sandbox/files/read', async (req, res) => {
    const body = zod_1.z
        .object({
        sandboxId: zod_1.z.string().min(1),
        apiKey: zod_1.z.string().min(1),
        filePath: zod_1.z.string().min(1),
    })
        .parse(req.body);
    const sandbox = await (0, sandbox_service_1.connectSandboxSession)({
        sandboxId: body.sandboxId,
        apiKey: body.apiKey,
        timeoutMs: 60 * 60 * 1000,
    });
    const exists = await sandbox.files.exists(body.filePath);
    if (!exists) {
        res.json({ exists: false, content: '' });
        return;
    }
    const content = await (0, sandbox_service_1.readPreviewFile)(sandbox, body.filePath);
    res.json({ exists: true, content });
});
app.post('/api/chat/stream', async (req, res) => {
    const body = zod_1.z
        .object({
        chatId: zod_1.z.string().min(1),
        message: zod_1.z.string().min(1),
        transcript: zod_1.z.array(zod_1.z.object({
            role: zod_1.z.enum(['system', 'user', 'assistant', 'tool']),
            content: zod_1.z.string(),
            tool_calls: zod_1.z
                .array(zod_1.z.object({
                id: zod_1.z.string(),
                type: zod_1.z.literal('function'),
                function: zod_1.z.object({
                    name: zod_1.z.string(),
                    arguments: zod_1.z.string(),
                }),
            }))
                .optional(),
            tool_call_id: zod_1.z.string().optional(),
            name: zod_1.z.string().optional(),
            timestamp: zod_1.z.string(),
        })),
        provider: zod_1.z.enum(['openrouter', 'groq', 'nvidia']),
        model: zod_1.z.string().min(1),
        credentials: zod_1.z.object({
            apiKey: zod_1.z.string().min(1),
            baseUrl: zod_1.z.string().url().optional(),
        }),
        sandbox: zod_1.z.object({
            apiKey: zod_1.z.string().min(1),
            sandboxId: zod_1.z.string().optional(),
            templateId: zod_1.z.string().optional(),
            timeoutMs: zod_1.z.number().optional(),
        }),
    })
        .parse(req.body);
    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    try {
        await (0, runtime_1.streamChatRun)(res, body);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown server error';
        res.write(`event: error\ndata: ${JSON.stringify({ message, recoverable: true })}\n\n`);
    }
    finally {
        res.end();
    }
});
app.use((error, _req, res, _next) => {
    logger_1.logger.error(error);
    if (error instanceof zod_1.z.ZodError) {
        res.status(400).json({
            error: 'Invalid request',
            details: error.flatten(),
        });
        return;
    }
    res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error',
    });
});
app.listen(config_1.env.PORT, () => {
    logger_1.logger.info(`Backend listening on http://localhost:${config_1.env.PORT}`);
});
//# sourceMappingURL=index.js.map