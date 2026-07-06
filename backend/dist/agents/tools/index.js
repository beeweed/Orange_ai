"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentTools = void 0;
exports.executeToolCall = executeToolCall;
const file_read_1 = require("./file_read");
const file_write_1 = require("./file_write");
const shared_1 = require("./shared");
exports.agentTools = [file_read_1.fileReadTool, file_write_1.fileWriteTool];
async function executeToolCall(name, rawArgs, context) {
    let parsedArgs;
    try {
        parsedArgs = rawArgs ? JSON.parse(rawArgs) : {};
    }
    catch {
        const result = {
            ok: false,
            operation: name,
            file_path: '/home/user/',
            message: 'Tool arguments were not valid JSON.',
            error: {
                code: 'INVALID_TOOL_ARGUMENTS',
                message: rawArgs,
            },
        };
        return { result, serialized: (0, shared_1.serializeToolResult)(result) };
    }
    let result;
    switch (name) {
        case 'file_read':
            result = await (0, file_read_1.executeFileRead)(parsedArgs, context);
            break;
        case 'file_write':
            result = await (0, file_write_1.executeFileWrite)(parsedArgs, context);
            break;
        default:
            result = {
                ok: false,
                operation: name,
                file_path: '/home/user/',
                message: 'Unknown tool requested.',
                error: {
                    code: 'UNKNOWN_TOOL',
                    message: name,
                },
            };
            break;
    }
    return { result, serialized: (0, shared_1.serializeToolResult)(result) };
}
//# sourceMappingURL=index.js.map