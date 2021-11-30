"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("@src/bootstrap/config"));
const logger_1 = __importDefault(require("@src/bootstrap/logger"));
// Only keeps the last 10 executions
const registerExecutionTime = () => {
    const currentDateTime = new Date().getTime();
    const executionTimeMS = currentDateTime - global.botExecutionMonitoringTick;
    if (config_1.default.isDev) {
        logger_1.default.log(`[PERF] - Executed in ${executionTimeMS}ms.`);
    }
    // Used for perf "How long on average does it take to monitor prices"
    global.perfMonitoringRecords.push(executionTimeMS);
    // Used for health check "When was the last execution"
    global.lastMonitoringDateTime = currentDateTime;
    if (global.perfMonitoringRecords.length === 21) {
        global.perfMonitoringRecords.shift();
    }
};
exports.default = registerExecutionTime;
//# sourceMappingURL=registerExecutionTime.js.map