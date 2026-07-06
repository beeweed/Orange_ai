"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.providerMetadata = void 0;
exports.assertProvider = assertProvider;
exports.resolveBaseUrl = resolveBaseUrl;
exports.createProviderClient = createProviderClient;
exports.listProviderModels = listProviderModels;
const openai_1 = __importDefault(require("openai"));
const zod_1 = require("zod");
const providerIdSchema = zod_1.z.enum(['openrouter', 'groq', 'nvidia']);
exports.providerMetadata = {
    openrouter: {
        label: 'OpenRouter',
        defaultBaseUrl: 'https://openrouter.ai/api/v1',
        docsUrl: 'https://openrouter.ai/docs/quickstart',
    },
    groq: {
        label: 'Groq',
        defaultBaseUrl: 'https://api.groq.com/openai/v1',
        docsUrl: 'https://console.groq.com/docs/openai',
    },
    nvidia: {
        label: 'NVIDIA NIM',
        defaultBaseUrl: 'https://integrate.api.nvidia.com/v1',
        docsUrl: 'https://docs.api.nvidia.com/nim/reference/llm-apis',
    },
};
function assertProvider(provider) {
    return providerIdSchema.parse(provider);
}
function resolveBaseUrl(config) {
    return config.baseUrl?.trim() || exports.providerMetadata[config.provider].defaultBaseUrl;
}
function createProviderClient(config) {
    return new openai_1.default({
        apiKey: config.apiKey,
        baseURL: resolveBaseUrl(config),
    });
}
function normalizeModel(raw) {
    const id = String(raw.id ?? raw.name ?? 'unknown-model');
    const supportedParameters = Array.isArray(raw.supported_parameters)
        ? raw.supported_parameters.map((item) => String(item))
        : [];
    return {
        id,
        name: String(raw.name ?? id),
        description: typeof raw.description === 'string' ? raw.description : undefined,
        contextWindow: typeof raw.context_length === 'number'
            ? raw.context_length
            : typeof raw.top_provider === 'object' && raw.top_provider && typeof raw.top_provider.context_length === 'number'
                ? (raw.top_provider.context_length)
                : undefined,
        supportsTools: supportedParameters.includes('tools'),
    };
}
async function listProviderModels(config) {
    const baseUrl = resolveBaseUrl(config);
    const response = await fetch(`${baseUrl}/models`, {
        headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error(`Provider model request failed with ${response.status} ${response.statusText}`);
    }
    const payload = (await response.json());
    const models = Array.isArray(payload.data) ? payload.data : [];
    return models.map(normalizeModel).sort((a, b) => a.name.localeCompare(b.name));
}
//# sourceMappingURL=index.js.map