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
const config_1 = __importDefault(require("./bootstrap/config"));
const eventEmitter_1 = __importDefault(require("./bootstrap/eventEmitter"));
const logger_1 = __importDefault(require("./bootstrap/logger"));
const findBestPaths_1 = __importDefault(require("./findBestPaths"));
const tokens_1 = require("./tokens");
const registerExecutionTime_1 = __importDefault(require("./utils/registerExecutionTime"));
const executeStrategy = ({ blockNumber, multicall, strategy, exchanges, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paths = yield (0, findBestPaths_1.default)({
            multicall,
            fromTokenDecimalAmounts: strategy.borrowedAmounts,
            fromToken: tokens_1.WETH,
            toToken: {
                symbol: strategy.toToken.symbol,
                address: strategy.toToken.address,
                decimals: strategy.toToken.decimals,
            },
            exchanges,
            slippageAllowancePercent: config_1.default.slippageAllowancePercent,
            gasPriceWei: global.currentGasPrices.rapid,
        });
        eventEmitter_1.default.emit('paths', blockNumber, paths);
    }
    catch (error) {
        eventEmitter_1.default.emit('error', error);
    }
});
const blockHandler = ({ multicall, exchanges }) => (blockNumber) => __awaiter(void 0, void 0, void 0, function* () {
    // Record time for perf monitoring
    global.botExecutionMonitoringTick = new Date().getTime();
    logger_1.default.log(`New block received. Block # ${blockNumber}`);
    if (global.isMonitoring) {
        logger_1.default.log('Block skipped! Price monitoring ongoing.');
    }
    // Check script isn't currently running
    if (global.isMonitoring) {
        return;
    }
    global.isMonitoring = true;
    // Execute all strategies simultaneously
    yield Promise.all(config_1.default.strategies.map((strategy) => executeStrategy({
        blockNumber,
        multicall,
        strategy,
        exchanges,
    })));
    // Reset monitoring status so the script doesn't stop
    global.isMonitoring = false;
    (0, registerExecutionTime_1.default)();
});
exports.default = blockHandler;
//# sourceMappingURL=blockHandler.js.map