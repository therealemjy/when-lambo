"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeName = void 0;
const Token_1 = __importDefault(require("@src/tokens/Token"));
// These values need to correspond to the ones used in the Transactor contract
var ExchangeName;
(function (ExchangeName) {
    ExchangeName["UniswapV2"] = "UniswapV2";
    ExchangeName["Sushiswap"] = "Sushiswap";
    ExchangeName["CryptoCom"] = "CryptoCom";
})(ExchangeName = exports.ExchangeName || (exports.ExchangeName = {}));
//# sourceMappingURL=types.js.map