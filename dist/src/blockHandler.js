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
const config_1 = __importDefault(require("./config"));
const eventEmitter_1 = __importDefault(require("./eventEmitter"));
const findBestPaths_1 = __importDefault(require("./findBestPaths"));
const tokens_1 = require("./tokens");
const blockHandler = (multicall, exchanges) => (blockNumber) => __awaiter(void 0, void 0, void 0, function* () {
    if (config_1.default.isDev) {
        console.log(`New block received. Block # ${blockNumber}`);
    }
    if (global.isMonitoring && config_1.default.isDev) {
        console.log('Block skipped! Price monitoring ongoing.');
    }
    else if (config_1.default.isDev) {
        console.time('monitorPrices');
    }
    if (global.isMonitoring) {
        return;
    }
    global.isMonitoring = true;
    try {
        const paths = yield (0, findBestPaths_1.default)({
            multicall,
            fromTokenDecimalAmounts: config_1.default.toToken.weiAmounts,
            fromToken: tokens_1.WETH,
            toToken: {
                symbol: config_1.default.toToken.symbol,
                address: config_1.default.toToken.address,
                decimals: config_1.default.toToken.decimals,
            },
            exchanges,
            slippageAllowancePercent: config_1.default.slippageAllowancePercent,
            gasPriceWei: global.currentGasPrices.rapid,
        });
        eventEmitter_1.default.emit('paths', paths);
    }
    catch (err) {
        eventEmitter_1.default.emit('error', err);
    }
    finally {
        // Make sure to reset monitoring status so the script doesn't stop
        if (config_1.default.isDev) {
            console.timeEnd('monitorPrices');
        }
        global.isMonitoring = false;
    }
});
exports.default = blockHandler;
//# sourceMappingURL=blockHandler.js.map