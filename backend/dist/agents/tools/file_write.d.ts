import type { StructuredToolResult } from '../../types';
import type { ToolContext } from './shared';
export declare const fileWriteTool: {
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
};
export type FileWriteArgs = {
    file_path: string;
    content: string;
};
export declare function executeFileWrite(args: FileWriteArgs, context: ToolContext): Promise<StructuredToolResult>;
//# sourceMappingURL=file_write.d.ts.map