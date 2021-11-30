"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const format_1 = __importDefault(require("date-fns/format"));
const formatTimestamp = (timestamp) => (0, format_1.default)(timestamp, 'd/M/yy HH:mm:ss');
exports.default = formatTimestamp;
//# sourceMappingURL=formatTimestamp.js.map