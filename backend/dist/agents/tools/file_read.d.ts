import type { StructuredToolResult } from '../../types';
import type { ToolContext } from './shared';
export declare const fileReadTool: {
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
};
export type FileReadArgs = {
    file_path: string;
};
export declare function executeFileRead(args: FileReadArgs, context: ToolContext): Promise<StructuredToolResult>;
//# sourceMappingURL=file_read.d.ts.map