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
const ethers_1 = require("ethers");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const addressProviderContract_json_1 = __importDefault(require("./contracts/addressProviderContract.json"));
const swapContract_json_1 = __importDefault(require("./contracts/swapContract.json"));
class Curve {
    constructor(provider) {
        // This allow us to get the right contract address
        // private async setUpSwapContract(provider: ethers.providers.Web3Provider){
        /*
          swapContract address and ABI can change
          if any error occurs, it might be due to a new contract ABI that needs to be updated
    
          ---
    
          You can get it this way:
          const swapContractAddress = await this.addressProvider.get_address(2, { gasLimit:100000 });
        */
        // }
        this.getDecimalAmountOut = ({ fromTokenDecimalAmount, fromToken, toToken }) => __awaiter(this, void 0, void 0, function* () {
            const res = yield this.swap['get_best_rate(address,address,uint256)'](fromToken.address, toToken.address, fromTokenDecimalAmount.toFixed());
            // // Price of 1 fromToken in toToken decimals
            const oneFromTokenSellRate = res[0].toString();
            // Price of 1 fromToken decimal in toToken decimals
            const oneFromTokenDecimalSellRate = new bignumber_js_1.default(oneFromTokenSellRate).dividedBy(1 * Math.pow(10, fromToken.decimals));
            // Total amount of toToken decimals we get from selling all the fromToken
            // decimals provided
            const totalToTokenDecimals = oneFromTokenDecimalSellRate.multipliedBy(fromTokenDecimalAmount);
            return totalToTokenDecimals;
        });
        this.provider = provider;
        this.name = 'Curve';
        this.estimatedGasForSwap = new bignumber_js_1.default(115000);
        this.addressProvider = new ethers_1.ethers.Contract(addressProviderContract_json_1.default.address, JSON.stringify(addressProviderContract_json_1.default.abi), provider);
        this.swap = new ethers_1.ethers.Contract(swapContract_json_1.default.address, JSON.stringify(swapContract_json_1.default.abi), provider);
    }
}
exports.default = Curve;
//# sourceMappingURL=index.js.map