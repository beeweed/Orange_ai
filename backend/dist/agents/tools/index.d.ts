import type { StructuredToolResult } from '../../types';
import { type ToolContext } from './shared';
export declare const agentTools: readonly [{
    readonly type: "function";
    readonly function: {
        readonly name: "file_read";
        readonly description: "Read the content of an existing file from the sandbox. Returns content with line numbers.";
        readonly parameters: {
            readonly type: "object";
            readonly properties: {
                readonly file_path: {
                    readonly type: "string";
                    readonly description: "Absolute path starting with /home/user/. Example: /home/user/project/src/main.py";
                };
            };
            readonly required: readonly ["file_path"];
        };
    };
}, {
    readonly type: "function";
    readonly function: {
        readonly name: "file_write";
        readonly description: "Create or overwrite a file at the given path inside the sandbox. Use for creating new files or fully rewriting existing ones.";
        readonly parameters: {
            readonly type: "object";
            readonly properties: {
                readonly file_path: {
                    readonly type: "string";
                    readonly description: "Absolute path starting with /home/user/. Example: /home/user/project/src/App.tsx";
                };
                readonly content: {
                    readonly type: "string";
                    readonly description: "The full content to write to the file.";
                };
            };
            readonly required: readonly ["file_path", "content"];
        };
    };
}];
export declare function executeToolCall(name: string, rawArgs: string, context: ToolContext): Promise<{
    result: StructuredToolResult;
    serialized: string;
}>;
//# sourceMappingURL=index.d.ts.map