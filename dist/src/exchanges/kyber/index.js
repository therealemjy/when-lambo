"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const types_1 = require("@src/types");
const kyberNetworkProxy_json_1 = __importDefault(require("./contracts/kyberNetworkProxy.json"));
class Kyber {
    constructor() {
        this.getDecimalAmountOutCallContext = (args) => {
            const { callReference, fromTokenDecimalAmounts, fromToken, toToken } = args;
            const calls = fromTokenDecimalAmounts.map((fromTokenDecimalAmount) => {
                const fixedFromTokenDecimalAmount = fromTokenDecimalAmount.toFixed();
                return {
                    reference: `getExpectedRate-${fixedFromTokenDecimalAmount}`,
                    methodName: 'getExpectedRate',
                    methodParameters: [fromToken.address, toToken.address, fromTokenDecimalAmount.toFixed()],
                };
            });
            return {
                context: {
                    reference: callReference,
                    contractAddress: kyberNetworkProxy_json_1.default.address,
                    abi: kyberNetworkProxy_json_1.default.abi,
                    calls,
                },
                resultsFormatter: this._formatDecimalAmountOutCallResults,
            };
        };
        this._formatDecimalAmountOutCallResults = (callResult, { fromToken, toToken }) => callResult.callsReturnContext
            // Filter out unsuccessful calls
            .filter((callReturnContext) => {
            const oneFromTokenSellRate = new bignumber_js_1.default(callReturnContext.returnValues[0].hex);
            return callReturnContext.success && oneFromTokenSellRate.isGreaterThan(0);
        })
            .map((callReturnContext) => {
            // Price of 1 fromToken in toToken decimals
            const oneFromTokenSellRate = new bignumber_js_1.default(callReturnContext.returnValues[0].hex);
            // Price of 1 fromToken decimal in toToken decimals
            const oneFromTokenDecimalSellRate = oneFromTokenSellRate.dividedBy(1 * Math.pow(10, fromToken.decimals));
            // Total amount of toToken decimals we get from selling all the fromToken
            // decimals provided
            const fromTokenDecimalAmount = new bignumber_js_1.default(callReturnContext.methodParameters[2]);
            const toTokenDecimalAmount = oneFromTokenDecimalSellRate.multipliedBy(fromTokenDecimalAmount);
            return {
                fromToken,
                fromTokenDecimalAmount,
                toToken,
                toTokenDecimalAmount,
                estimatedGas: new bignumber_js_1.default(400000),
            };
        });
        this.name = types_1.ExchangeName.Kyber;
    }
}
exports.default = Kyber;
//# sourceMappingURL=index.js.map