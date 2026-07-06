"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSandboxSession = createSandboxSession;
exports.connectSandboxSession = connectSandboxSession;
exports.getOrCreateSandbox = getOrCreateSandbox;
exports.buildFileTree = buildFileTree;
exports.readPreviewFile = readPreviewFile;
const e2b_1 = require("e2b");
const node_path_1 = __importDefault(require("node:path"));
const DEFAULT_TIMEOUT_MS = 60 * 60 * 1000;
const ROOT_PATH = '/home/user';
function sortEntries(entries) {
    return [...entries].sort((left, right) => {
        const leftType = left.type === 'dir' ? 0 : 1;
        const rightType = right.type === 'dir' ? 0 : 1;
        if (leftType !== rightType) {
            return leftType - rightType;
        }
        return left.name.localeCompare(right.name);
    });
}
function extensionFor(nodePath) {
    const extension = node_path_1.default.extname(nodePath);
    return extension ? extension.slice(1).toLowerCase() : undefined;
}
async function createSandboxSession(config) {
    const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const sandbox = config.templateId
        ? await e2b_1.Sandbox.create(config.templateId, { apiKey: config.apiKey, timeoutMs })
        : await e2b_1.Sandbox.create({ apiKey: config.apiKey, timeoutMs });
    return {
        sandbox,
        session: {
            sandboxId: sandbox.sandboxId,
            templateId: config.templateId,
            createdAt: new Date().toISOString(),
        },
    };
}
async function connectSandboxSession(config) {
    if (!config.sandboxId) {
        throw new Error('sandboxId is required to connect to a sandbox session.');
    }
    return e2b_1.Sandbox.connect(config.sandboxId, {
        apiKey: config.apiKey,
        timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    });
}
async function getOrCreateSandbox(config) {
    if (config.sandboxId) {
        const sandbox = await connectSandboxSession(config);
        return {
            sandbox,
            created: false,
            session: {
                sandboxId: sandbox.sandboxId,
                templateId: config.templateId,
                createdAt: new Date().toISOString(),
            },
        };
    }
    const created = await createSandboxSession(config);
    return { ...created, created: true };
}
async function buildFileTree(sandbox, currentPath = ROOT_PATH) {
    const entries = await sandbox.files.list(currentPath);
    const ordered = sortEntries(entries);
    return Promise.all(ordered.map(async (entry) => {
        const node = {
            name: entry.name,
            path: entry.path,
            type: entry.type === 'dir' ? 'dir' : 'file',
            extension: entry.type === 'dir' ? undefined : extensionFor(entry.path),
        };
        if (entry.type === 'dir') {
            try {
                node.children = await buildFileTree(sandbox, entry.path);
            }
            catch {
                node.children = [];
            }
        }
        return node;
    }));
}
async function readPreviewFile(sandbox, filePath) {
    return sandbox.files.read(filePath);
}
//# sourceMappingURL=sandbox-service.js.map