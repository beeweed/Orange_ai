import type { Sandbox } from 'e2b';
import type { StructuredToolResult } from '../../types';
export type ToolContext = {
    sandbox: Sandbox;
};
export declare function assertSandboxPath(filePath: string): void;
export declare function withLineNumbers(content: string): string;
export declare function serializeToolResult(result: StructuredToolResult): string;
//# sourceMappingURL=shared.d.ts.map