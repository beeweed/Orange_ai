import OpenAI from 'openai';
import type { ProviderConfig, ProviderId, ProviderModel } from '../../types';
export declare const providerMetadata: Record<ProviderId, {
    label: string;
    defaultBaseUrl: string;
    docsUrl: string;
}>;
export declare function assertProvider(provider: string): ProviderId;
export declare function resolveBaseUrl(config: ProviderConfig): string;
export declare function createProviderClient(config: ProviderConfig): OpenAI;
export declare function listProviderModels(config: ProviderConfig): Promise<ProviderModel[]>;
//# sourceMappingURL=index.d.ts.map