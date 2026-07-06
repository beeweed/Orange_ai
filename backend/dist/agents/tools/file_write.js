"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileWriteTool = void 0;
exports.executeFileWrite = executeFileWrite;
const shared_1 = require("./shared");
exports.fileWriteTool = {
    type: 'function',
    function: {
        name: 'file_write',
        description: 'Create or overwrite a file at the given path inside the sandbox. Use for creating new files or fully rewriting existing ones.',
        parameters: {
            type: 'object',
            properties: {
                file_path: {
                    type: 'string',
                    description: 'Absolute path starting with /home/user/. Example: /home/user/project/src/App.tsx'
                },
                content: {
                    type: 'string',
                    description: 'The full content to write to the file.'
                }
            },
            required: ['file_path', 'content']
        }
    }
};
async function executeFileWrite(args, context) {
    (0, shared_1.assertSandboxPath)(args.file_path);
    await context.sandbox.files.write(args.file_path, args.content);
    return {
        ok: true,
        operation: 'file_write',
        file_path: args.file_path,
        message: 'File created or overwritten successfully.',
        bytes: Buffer.byteLength(args.content, 'utf8'),
    };
}
//# sourceMappingURL=file_write.js.map