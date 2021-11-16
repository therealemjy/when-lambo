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
const findBestPath_1 = __importDefault(require("./findBestPath"));
const monitorPrices = ({ refTokenDecimalAmounts, refToken, tradedToken, exchanges, slippageAllowancePercent, gasPriceWei, }) => __awaiter(void 0, void 0, void 0, function* () {
    const paths = yield Promise.all(refTokenDecimalAmounts.map((refTokenDecimalAmount) => (0, findBestPath_1.default)({
        refTokenDecimalAmount,
        refToken,
        tradedToken,
        exchanges,
        slippageAllowancePercent,
        gasPriceWei,
    })));
    const validPaths = paths.filter((path) => path !== undefined);
    return validPaths;
});
exports.default = monitorPrices;
//# sourceMappingURL=monitorPrices.js.map