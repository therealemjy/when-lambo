"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serialize_error_1 = require("serialize-error");
const formatError = (error) => {
    const serialized = (0, serialize_error_1.serializeError)(error);
    return JSON.stringify(serialized, null, 2);
};
exports.default = formatError;
//# sourceMappingURL=formatError.js.map