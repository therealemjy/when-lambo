"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XYO = exports.VLX = exports.LRC = exports.MANA = exports.SAND = exports.LINK = exports.AAVE = exports.SHIB = exports.DAI = exports.WETH = exports.ETH = void 0;
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
exports.DAI = new Token_1.default({
    symbol: 'DAI',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
});
exports.SHIB = new Token_1.default({
    symbol: 'SHIB',
    address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
    decimals: 18,
});
exports.AAVE = new Token_1.default({
    symbol: 'AAVE',
    address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    decimals: 18,
});
exports.LINK = new Token_1.default({
    symbol: 'LINK',
    address: '0x514910771af9ca656af840dff83e8264ecf986ca',
    decimals: 18,
});
exports.SAND = new Token_1.default({
    symbol: 'SAND',
    address: '0x3845badade8e6dff049820680d1f14bd3903a5d0',
    decimals: 18,
});
exports.MANA = new Token_1.default({
    symbol: 'MANA',
    address: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
    decimals: 18,
});
exports.LRC = new Token_1.default({
    symbol: 'LRC',
    address: '0xbbbbca6a901c926f240b89eacb641d8aec7aeafd',
    decimals: 18,
});
exports.VLX = new Token_1.default({
    symbol: 'VLX',
    address: '0x8c543aed163909142695f2d2acd0d55791a9edb9',
    decimals: 18,
});
exports.XYO = new Token_1.default({
    symbol: 'XYO',
    address: '0x55296f69f40ea6d20e478533c15a6b08b654e758',
    decimals: 18,
});
//# sourceMappingURL=index.js.map