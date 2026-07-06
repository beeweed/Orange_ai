"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(8080),
    FRONTEND_ORIGIN: zod_1.z.string().default('*'),
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
});
exports.env = envSchema.parse(process.env);
//# sourceMappingURL=config.js.map