"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const format_1 = __importDefault(require("date-fns/format"));
const calculateProfit_1 = __importDefault(require("./calculateProfit"));
const extractDataFromPath = (path) => {
    const timestamp = (0, format_1.default)(path[0].timestamp, 'd/M/yy HH:mm:ss');
    const borrowedDec = path[0].fromTokenDecimalAmount.toFixed();
    const boughtDec = path[0].toTokenDecimalAmount.toFixed(0);
    const revenues = path[1].toTokenDecimalAmount.toFixed(0);
    const bestSellingExchangeName = path[0].exchange.name;
    const bestBuyingExchangeName = path[1].exchange.name;
    const gasCost = path[0].estimatedGasCost.plus(path[1].estimatedGasCost);
    const [profitDec, profitPercent] = (0, calculateProfit_1.default)({
        revenueDec: path[1].toTokenDecimalAmount,
        // Add gas cost to expense. Note that this logic only works because we
        // start and end the path with WETH
        expenseDec: path[0].fromTokenDecimalAmount.plus(gasCost),
    });
    const fromTokenSymbol = path[0].fromToken.symbol;
    const toTokenSymbol = path[0].toToken.symbol;
    return {
        timestamp,
        borrowedDec,
        boughtDec,
        revenues,
        bestSellingExchangeName,
        bestBuyingExchangeName,
        profitDec,
        profitPercent,
        gasCost,
        fromTokenSymbol,
        toTokenSymbol,
    };
};
exports.default = extractDataFromPath;
//# sourceMappingURL=extractDataFromPath.js.map