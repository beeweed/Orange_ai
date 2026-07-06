import { Sandbox } from 'e2b';
import type { FileNode, SandboxConfigInput, SandboxSessionSummary } from './types';
export declare function createSandboxSession(config: SandboxConfigInput): Promise<{
    sandbox: Sandbox;
    session: SandboxSessionSummary;
}>;
export declare function connectSandboxSession(config: SandboxConfigInput): Promise<Sandbox>;
export declare function getOrCreateSandbox(config: SandboxConfigInput): Promise<{
    sandbox: Sandbox;
    session: SandboxSessionSummary;
    created: boolean;
}>;
export declare function buildFileTree(sandbox: Sandbox, currentPath?: string): Promise<FileNode[]>;
export declare function readPreviewFile(sandbox: Sandbox, filePath: string): Promise<string>;
//# sourceMappingURL=sandbox-service.d.ts.map