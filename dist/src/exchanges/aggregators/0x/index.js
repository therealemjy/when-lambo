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
class ZeroX {
    constructor() {
        this._getExchangeName = (nameFrom1InchAPI) => {
            switch (nameFrom1InchAPI) {
                case 'Uniswap_V2':
                    return types_1.ExchangeName.UniswapV2;
                case 'Kyber':
                    return types_1.ExchangeName.Kyber;
                case 'SushiSwap':
                    return types_1.ExchangeName.Sushiswap;
                case 'Balancer_V2':
                    return types_1.ExchangeName.BalancerV2;
                case 'Curve_V2':
                    return types_1.ExchangeName.CurveV2;
                case 'CryptoCom':
                    return types_1.ExchangeName.CryptoCom;
                default:
                    return undefined;
            }
        };
        this.getDecimalAmountOut = ({ fromTokenDecimalAmount, fromToken, toToken }) => __awaiter(this, void 0, void 0, function* () {
            // TODO: add typing
            const res = yield axios_1.default.get('	https://api.0x.org/swap/v1/quote', {
                params: {
                    sellToken: fromToken.address,
                    buyToken: toToken.address,
                    sellAmount: fromTokenDecimalAmount.toFixed()
                }
            });
            // TODO: handle protocol fee? See https://0x.org/docs/api#response-1
            // Get the sources from which a proportion of the deal comes from
            const usedExchangeNames = res.data.sources.reduce((allUsedExchangeNames, source) => {
                const exchangeName = this._getExchangeName(source.name);
                return source.proportion === '0' || !exchangeName || allUsedExchangeNames.includes(exchangeName) ? allUsedExchangeNames : [...allUsedExchangeNames, exchangeName];
            }, [types_1.ExchangeName.ZeroX]);
            return {
                decimalAmountOut: new bignumber_js_1.default(res.buyAmount),
                usedExchangeNames,
                estimatedGas: new bignumber_js_1.default(res.data.estimatedGas)
            };
        });
        this.name = types_1.ExchangeName.OneInch;
    }
}
exports.default = ZeroX;
//# sourceMappingURL=index.js.map