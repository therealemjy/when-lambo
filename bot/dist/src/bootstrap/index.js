"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const http_1 = __importDefault(require("http"));
const registerEvents_1 = require("./eventEmitter/registerEvents");
const fetchSecrets_1 = __importDefault(require("./fetchSecrets"));
const gasPriceWatcher_1 = __importDefault(require("./gasPriceWatcher"));
const logger_1 = __importDefault(require("./logger"));
// We set global variable to their default value
const setupGlobalStateVariables = () => {
    // True while the bot compares the prices
    global.isMonitoring = false;
    // Set to the last date the bot checked prices
    global.lastMonitoringDateTime = null;
    global.botExecutionMonitoringTick = 0;
    global.perfMonitoringRecords = [];
};
const server = http_1.default.createServer(function (req, res) {
    // GET /health
    if (req.url === '/health' && req.method === 'GET') {
        if (!global.lastMonitoringDateTime) {
            res.writeHead(500);
            res.end('Monitoring not started yet');
            return;
        }
        const currentDateTime = new Date().getTime();
        const secondsElapsedSinceLastMonitoring = (currentDateTime - global.lastMonitoringDateTime) / 1000;
        if (secondsElapsedSinceLastMonitoring >= 60) {
            res.writeHead(500);
            res.end(`Last monitoring was more than 60 seconds ago (${secondsElapsedSinceLastMonitoring}s)`);
            return;
        }
        res.writeHead(200);
        res.end(`Last monitoring was ${secondsElapsedSinceLastMonitoring} seconds ago`);
    }
    if (req.url === '/perf' && req.method === 'GET') {
        if (!global.perfMonitoringRecords) {
            res.writeHead(500);
            res.end('Monitoring not started yet');
            return;
        }
        const sum = global.perfMonitoringRecords.reduce((a, b) => (a += b));
        const len = global.perfMonitoringRecords.length;
        res.writeHead(200);
        res.end(`Average monitoring speed: ${sum / len}ms`);
    }
});
const bootstrap = () => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve) => {
        server.listen(3000, () => __awaiter(void 0, void 0, void 0, function* () {
            logger_1.default.log('Server started running on port 3000');
            setupGlobalStateVariables();
            // Get secrets
            const secret = yield (0, fetchSecrets_1.default)();
            console.log('Secret is:', secret);
            // Register event listeners
            yield (0, registerEvents_1.registerEventListeners)();
            // Pull gas prices every 5 seconds
            gasPriceWatcher_1.default.start(5000);
            resolve();
        }));
    });
});
exports.bootstrap = bootstrap;
//# sourceMappingURL=index.js.map