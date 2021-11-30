"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const types_1 = require("@src/types");
const cryptoComRouter_json_1 = __importDefault(require("./contracts/cryptoComRouter.json"));
class CryptoCom {
    constructor() {
        this.getDecimalAmountOutCallContext = ({ callReference, fromTokenDecimalAmounts, fromToken, toToken, }) => {
            const calls = fromTokenDecimalAmounts.map((fromTokenDecimalAmount) => {
                const fixedFromTokenDecimalAmount = fromTokenDecimalAmount.toFixed();
                return {
                    reference: `getAmountsOut-${fixedFromTokenDecimalAmount}`,
                    methodName: 'getAmountsOut',
                    methodParameters: [fixedFromTokenDecimalAmount, [fromToken.address, toToken.address]],
                };
            });
            return {
                context: {
                    reference: callReference,
                    contractAddress: cryptoComRouter_json_1.default.address,
                    abi: cryptoComRouter_json_1.default.abi,
                    calls,
                },
                resultsFormatter: (callResult) => callResult.callsReturnContext
                    // Filter out unsuccessful calls
                    .filter((callReturnContext) => callReturnContext.success && callReturnContext.returnValues.length >= 2)
                    .map((callReturnContext) => ({
                    fromToken,
                    fromTokenDecimalAmount: new bignumber_js_1.default(callReturnContext.methodParameters[0]),
                    toToken,
                    toTokenDecimalAmount: new bignumber_js_1.default(callReturnContext.returnValues[1].hex),
                    estimatedGas: new bignumber_js_1.default(115000),
                })),
            };
        };
        this.name = types_1.ExchangeName.CryptoCom;
    }
}
exports.default = CryptoCom;
//# sourceMappingURL=index.js.map