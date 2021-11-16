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
const ExchangeProxy_json_1 = __importDefault(require("./contracts/ExchangeProxy.json"));
class Balancer {
    constructor(provider) {
        this.getDecimalAmountOut = ({ fromTokenDecimalAmount, fromToken, toToken }) => __awaiter(this, void 0, void 0, function* () {
            const [_swaps, totalAmounts] = yield this.exchangeProxy.viewSplitExactIn(fromToken.address, toToken.address, fromTokenDecimalAmount.toFixed(), 4);
            return new bignumber_js_1.default(totalAmounts.toString());
        });
        this.provider = provider;
        this.name = 'Balancer';
        this.estimatedGasForSwap = new bignumber_js_1.default(166270);
        this.exchangeProxy = new ethers_1.ethers.Contract(ExchangeProxy_json_1.default.address, ExchangeProxy_json_1.default.abi, provider);
    }
}
exports.default = Balancer;
//# sourceMappingURL=index.js.map