"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const types_1 = require("@src/types");
const balancerV1ExchangeProxy_json_1 = __importDefault(require("./contracts/balancerV1ExchangeProxy.json"));
// Number of pools we allow Balancer to take the funds from. Note: we're
// currently setting it to 1 as we're not sure if taking funds from multiple
// pools increases the gas cost or not.
// TODO: check if that's true or if we can increase the number of pools
const N_POOLS = 1;
class BalancerV1 {
    constructor() {
        this.getDecimalAmountOutCallContext = ({ callReference, fromTokenDecimalAmounts, fromToken, toToken }) => {
            const calls = fromTokenDecimalAmounts.map(fromTokenDecimalAmount => {
                const fixedFromTokenDecimalAmount = fromTokenDecimalAmount.toFixed();
                return {
                    reference: `viewSplitExactIn-${fixedFromTokenDecimalAmount}`,
                    methodName: 'viewSplitExactIn',
                    methodParameters: [fromToken.address, toToken.address, fromTokenDecimalAmount.toFixed(), N_POOLS],
                };
            });
            return {
                context: {
                    reference: callReference,
                    contractAddress: balancerV1ExchangeProxy_json_1.default.address,
                    abi: balancerV1ExchangeProxy_json_1.default.abi,
                    calls,
                },
                resultFormatter: (callResult) => (callResult.callsReturnContext
                    // Filter out unsuccessful calls
                    .filter(callReturnContext => callReturnContext.success)
                    .map(callReturnContext => ({
                    fromToken,
                    fromTokenDecimalAmount: new bignumber_js_1.default(callReturnContext.methodParameters[2]),
                    toToken,
                    toTokenDecimalAmount: new bignumber_js_1.default(callReturnContext.returnValues[1].toString()),
                    estimatedGas: new bignumber_js_1.default(165000)
                })))
            };
        };
        this.name = types_1.ExchangeName.BalancerV1;
    }
}
exports.default = BalancerV1;
//# sourceMappingURL=index.js.map