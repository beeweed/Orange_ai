"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertSandboxPath = assertSandboxPath;
exports.withLineNumbers = withLineNumbers;
exports.serializeToolResult = serializeToolResult;
function assertSandboxPath(filePath) {
    if (!filePath.startsWith('/home/user/')) {
        throw new Error('Only absolute sandbox paths starting with /home/user/ are allowed.');
    }
}
function withLineNumbers(content) {
    const lines = content.split(/\r?\n/);
    return lines
        .map((line, index) => `${String(index + 1).padStart(6, ' ')}\t${line}`)
        .join('\n');
}
function serializeToolResult(result) {
    return JSON.stringify(result);
}
//# sourceMappingURL=shared.js.map