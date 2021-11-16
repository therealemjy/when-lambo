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
const findBestDeal_1 = __importDefault(require("./findBestDeal"));
const findBestPath = ({ refTokenDecimalAmount, refToken, tradedToken, exchanges, slippageAllowancePercent, gasPriceWei, }) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the highest amount of tradedToken decimals we can get from selling all
    // refTokenDecimalAmount
    const bestSellingDeal = yield (0, findBestDeal_1.default)({
        refTokenDecimalAmount,
        refToken,
        tradedToken,
        exchanges,
        slippageAllowancePercent,
        gasPriceWei,
    });
    if (!bestSellingDeal) {
        return undefined;
    }
    // Find the highest amount of refToken decimals we can get back, considering
    // the gas cost of the operation, from selling all tradedToken decimals
    const bestBuyingDeal = yield (0, findBestDeal_1.default)({
        refTokenDecimalAmount: bestSellingDeal.toTokenDecimalAmount,
        refToken: bestSellingDeal.toToken,
        tradedToken: bestSellingDeal.fromToken,
        // Remove the exchanges used in the best deal
        exchanges: exchanges.filter((exchange) => !bestSellingDeal.usedExchangeNames.includes(exchange.name)),
        slippageAllowancePercent,
        gasPriceWei,
    });
    if (!bestBuyingDeal) {
        return undefined;
    }
    // Return best path
    return [bestSellingDeal, bestBuyingDeal];
});
exports.default = findBestPath;
//# sourceMappingURL=findBestPath.js.map