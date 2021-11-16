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
const axios_1 = __importDefault(require("axios"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const types_1 = require("@src/types");
class OneInch {
    constructor() {
        this._getExchangeName = (nameFrom1InchAPI) => {
            switch (nameFrom1InchAPI) {
                case 'UNISWAP_V2':
                    return types_1.ExchangeName.UniswapV2;
                case 'KYBER':
                    return types_1.ExchangeName.Kyber;
                case 'SUSHI':
                    return types_1.ExchangeName.Sushiswap;
                case 'BALANCER_V2':
                    return types_1.ExchangeName.BalancerV2;
                case 'CURVE_V2':
                    return types_1.ExchangeName.CurveV2;
                case 'DEFISWAP':
                    return types_1.ExchangeName.CryptoCom;
                default:
                    return undefined;
            }
        };
        this.getDecimalAmountOut = ({ fromTokenDecimalAmount, fromToken, toToken }) => __awaiter(this, void 0, void 0, function* () {
            // TODO: add typing
            const res = yield axios_1.default.get('https://api.1inch.exchange/v3.0/1/quote', {
                params: {
                    fromTokenAddress: fromToken.address,
                    toTokenAddress: toToken.address,
                    amount: fromTokenDecimalAmount.toFixed()
                }
            });
            const usedExchangeNames = res.data.protocols.flat(4).reduce((allUsedExchangeNames, protocol) => {
                const exchangeName = this._getExchangeName(protocol.name);
                return !exchangeName || allUsedExchangeNames.includes(exchangeName) ? allUsedExchangeNames : [...allUsedExchangeNames, exchangeName];
            }, [types_1.ExchangeName.OneInch]);
            return {
                decimalAmountOut: new bignumber_js_1.default(res.data.toTokenAmount),
                usedExchangeNames,
                estimatedGas: new bignumber_js_1.default(res.data.estimatedGas)
            };
        });
        this.name = types_1.ExchangeName.OneInch;
    }
}
exports.default = OneInch;
//# sourceMappingURL=index.js.map