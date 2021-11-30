"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WETH = exports.ETH = void 0;
const Token_1 = __importDefault(require("./Token"));
exports.ETH = new Token_1.default({
    symbol: 'ETH',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
});
exports.WETH = new Token_1.default({
    symbol: 'WETH',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    decimals: 18,
});
//# sourceMappingURL=index.js.map