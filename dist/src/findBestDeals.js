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
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const tokens_1 = require("./tokens");
// Get the gas cost of a deal, in the currency (in decimals) of the traded
// token. Note that this logic only works because we're currently only trading
// for or from WETH decimals.
const getConvertedDealGasCost = (deal) => {
    if (deal.toToken.address === tokens_1.WETH.address) {
        // Since the traded token is in WETH, we can directly return the
        // estimated gas cost as it's already expressed in wei
        return deal.estimatedGasCost;
    }
    // Otherwise we convert the gas cost in the currency of the traded token
    const fromTokenDecimalPriceInToTokenDecimals = deal.toTokenDecimalAmount
        .dividedBy(deal.fromTokenDecimalAmount) // In this case, we know fromTokenDecimalAmount is expressed in wei
        .toFixed(0);
    return deal.estimatedGasCost.multipliedBy(fromTokenDecimalPriceInToTokenDecimals);
};
const findBestDeals = ({ multicall, fromTokenDecimalAmounts, fromToken, toToken, exchanges, slippageAllowancePercent, gasPriceWei, usedExchangeNames, // Reference of all the exchanges used to obtain each fromTokenDecimalAmount
 }) => __awaiter(void 0, void 0, void 0, function* () {
    const resultsFormatters = {};
    // Get prices from all the exchanges
    const multicallContexts = exchanges.reduce((contexts, exchange) => {
        const filteredfromTokenDecimalAmounts = !usedExchangeNames
            ? fromTokenDecimalAmounts
            : // If usedExchangeNames was provided, remove all the fromTokenDecimalAmounts
                // previously found on the exchange. We do this to prevent front-running
                // ourselves by buying from an exchange and selling to the same exchange
                // in the same path.
                fromTokenDecimalAmounts.filter((fromTokenDecimalAmount) => usedExchangeNames[fromTokenDecimalAmount.toFixed()] !== exchange.name);
        const { context, resultsFormatter } = exchange.getDecimalAmountOutCallContext({
            callReference: exchange.name,
            fromTokenDecimalAmounts: filteredfromTokenDecimalAmounts,
            fromToken,
            toToken,
        });
        resultsFormatters[exchange.name] = resultsFormatter;
        return [...contexts, context];
    }, []);
    const multicallRes = yield multicall.call(multicallContexts, {
        gasLimit: 999999999999999, // Add stupid value to prevent issues with view functions running out of gas
    });
    // Find the best deal for each fromTokenDecimalAmount
    const bestDeals = {};
    exchanges.forEach((exchange) => {
        // Skip exchange if none of the results were found using it
        if (!multicallRes.results[exchange.name]) {
            return;
        }
        // Format results
        const resultsFormatter = resultsFormatters[exchange.name];
        const formattedResults = resultsFormatter(multicallRes.results[exchange.name], { fromToken, toToken });
        // Go through each result to find the best deal for each fromTokenDecimalAmount
        formattedResults.forEach((formattedResult) => {
            // Apply maximum slippage allowance, which means any deal found is
            // calculated with the most pessimistic outcome (given our slippage
            // allowance). If we still yield a profit despite this, then we consider
            // the opportunity safe.
            const pessimisticToTokenDecimalAmount = new bignumber_js_1.default(formattedResult.toTokenDecimalAmount.multipliedBy((100 - slippageAllowancePercent) / 100).toFixed(0));
            const deal = {
                timestamp: new Date(),
                exchangeName: exchange.name,
                fromToken,
                fromTokenDecimalAmount: formattedResult.fromTokenDecimalAmount,
                toToken,
                toTokenDecimalAmount: pessimisticToTokenDecimalAmount,
                slippageAllowancePercent,
                estimatedGasCost: gasPriceWei.multipliedBy(formattedResult.estimatedGas),
            };
            const currentBestDeal = bestDeals[formattedResult.fromTokenDecimalAmount.toFixed()];
            // If no best deal has been determined for the current
            // fromTokenDecimalAmount yet, we assign this deal as the current best
            if (!currentBestDeal) {
                bestDeals[formattedResult.fromTokenDecimalAmount.toFixed()] = deal;
                return;
            }
            // We incorporate the total gas cost of the swap necessary to make the
            // deal by first calculating its price in the currency of the traded
            // token, then deducting it from the total amount of decimals received
            // from the swap
            const dealRevenuesMinusGas = pessimisticToTokenDecimalAmount.minus(getConvertedDealGasCost(deal));
            const currentBestDealRevenuesMinusGas = currentBestDeal.toTokenDecimalAmount.minus(getConvertedDealGasCost(currentBestDeal));
            // If the deal is better than the current best deal, we assign is as the
            // new best deal
            if (dealRevenuesMinusGas.isGreaterThan(currentBestDealRevenuesMinusGas)) {
                bestDeals[formattedResult.fromTokenDecimalAmount.toFixed()] = deal;
            }
        });
    });
    // Return best deals in the form of an array, sorted in the same order as
    // fromTokenDecimalAmounts
    return Object.keys(bestDeals).map((key) => bestDeals[key]);
});
exports.default = findBestDeals;
//# sourceMappingURL=findBestDeals.js.map