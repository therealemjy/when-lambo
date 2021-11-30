"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("@src/bootstrap/config"));
const logger_1 = __importDefault(require("@src/bootstrap/logger"));
const formatError_1 = __importDefault(require("@src/utils/formatError"));
const sendSlackMessage_1 = __importStar(require("@src/utils/sendSlackMessage"));
const handleError = (error, isUncaughtException = false) => {
    // Format the error to a human-readable format and send it to slack
    const formattedError = (0, formatError_1.default)(error);
    logger_1.default.error(isUncaughtException ? 'Uncaught exception:' : 'Emitted error:', formattedError);
    if (config_1.default.isProd) {
        const slackBlock = (0, sendSlackMessage_1.formatErrorToSlackBlock)(formattedError, config_1.default.serverId);
        (0, sendSlackMessage_1.default)(slackBlock, 'errors');
    }
};
exports.default = handleError;
//# sourceMappingURL=handleError.js.map