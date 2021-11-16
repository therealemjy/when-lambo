"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const types_1 = require("@src/types");
const swapContract_json_1 = __importDefault(require("./contracts/swapContract.json"));
class CurveV2 {
    constructor() {
        // This allows us to get the right contract address
        // private async setUpSwapContract(provider: ethers.providers.Web3Provider){
        /*
            swapContract address and ABI can change if any error occurs, it might be
            due to a new contract ABI that needs to be updated
      
            ---
      
            You can get it by using the addressProviderContract (see
            contracts/addressProviderContract.json), this way:
            const swapContractAddress = await this.addressProvider.get_address(2, { gasLimit:100000 });
          */
        // }
        this.getDecimalAmountOutCallContext = (args) => {
            const { callReference, fromTokenDecimalAmounts, fromToken, toToken } = args;
            const calls = fromTokenDecimalAmounts.map((fromTokenDecimalAmount) => {
                const fixedFromTokenDecimalAmount = fromTokenDecimalAmount.toFixed();
                return {
                    reference: `get_best_rate(address,address,uint256)-${fixedFromTokenDecimalAmount}`,
                    methodName: 'get_best_rate(address,address,uint256)',
                    methodParameters: [fromToken.address, toToken.address, fromTokenDecimalAmount.toFixed()],
                };
            });
            return {
                context: {
                    reference: callReference,
                    contractAddress: swapContract_json_1.default.address,
                    abi: swapContract_json_1.default.abi,
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
                estimatedGas: new bignumber_js_1.default(115000),
            };
        });
        this.name = types_1.ExchangeName.CurveV2;
    }
}
exports.default = CurveV2;
//# sourceMappingURL=index.js.map