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
const findBestDeals_1 = __importDefault(require("./findBestDeals"));
const findBestPaths = ({ multicall, fromToken, fromTokenDecimalAmounts, toToken, exchanges, slippageAllowancePercent, gasPriceWei, }) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the highest amount of toToken decimals we can buy with each
    // fromTokenDecimalAmount
    const bestBuyingDeals = yield (0, findBestDeals_1.default)({
        multicall,
        fromToken,
        fromTokenDecimalAmounts,
        toToken,
        exchanges,
        slippageAllowancePercent,
        gasPriceWei,
    });
    if (!bestBuyingDeals.length) {
        return [];
    }
    // List exchanges used for each fromTokenDecimalAmount
    const usedExchangeNames = bestBuyingDeals.reduce((acc, bestBuyingDeal) => (Object.assign(Object.assign({}, acc), { [bestBuyingDeal.toTokenDecimalAmount.toFixed()]: bestBuyingDeal.exchangeName })), {});
    // Find the highest amount of fromToken decimals we can get back from selling
    // each toToken decimals obtained from the selling deals
    const bestSellingDeals = yield (0, findBestDeals_1.default)({
        multicall,
        fromToken: toToken,
        fromTokenDecimalAmounts: bestBuyingDeals.map((bestBuyingDeal) => bestBuyingDeal.toTokenDecimalAmount),
        toToken: fromToken,
        exchanges,
        slippageAllowancePercent,
        gasPriceWei,
        usedExchangeNames,
    });
    if (!bestSellingDeals.length) {
        return [];
    }
    // Compose best paths
    const bestPaths = bestBuyingDeals.reduce((paths, bestBuyingDeal) => {
        // Find corresponding best selling deal
        const correspondingBestSellingDeal = bestSellingDeals.find((bestSellingDeal) => bestSellingDeal.fromTokenDecimalAmount.isEqualTo(bestBuyingDeal.toTokenDecimalAmount));
        if (!correspondingBestSellingDeal) {
            return paths;
        }
        const path = [bestBuyingDeal, correspondingBestSellingDeal];
        return [...paths, path];
    }, []);
    return bestPaths;
});
exports.default = findBestPaths;
//# sourceMappingURL=findBestPaths.js.map