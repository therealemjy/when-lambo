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
const types_1 = require("@src/types");
const balancerV2ExchangeProxy_json_1 = __importDefault(require("./contracts/balancerV2ExchangeProxy.json"));
class BalancerV2 {
    constructor(provider) {
        this.getDecimalAmountOut = ({ fromTokenDecimalAmount, fromToken, toToken }) => __awaiter(this, void 0, void 0, function* () {
            const [_swaps, totalAmounts] = yield this.exchangeProxy.viewSplitExactIn(fromToken.address, toToken.address, fromTokenDecimalAmount.toFixed(), 4);
            return {
                decimalAmountOut: new bignumber_js_1.default(totalAmounts.toString()),
                usedExchangeNames: [types_1.ExchangeName.BalancerV2],
                estimatedGas: new bignumber_js_1.default(166270)
            };
        });
        this.provider = provider;
        this.name = types_1.ExchangeName.BalancerV2;
        this.exchangeProxy = new ethers_1.ethers.Contract(balancerV2ExchangeProxy_json_1.default.address, balancerV2ExchangeProxy_json_1.default.abi, provider);
    }
}
exports.default = BalancerV2;
//# sourceMappingURL=index.js.map