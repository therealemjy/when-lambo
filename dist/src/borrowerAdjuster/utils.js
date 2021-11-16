"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateNextBorrowingStrategy = exports.findMostProfitableDeal = exports.formatPathsToDeals = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const formatPathsToDeals = (paths) => {
    return paths.map(({ borrowedDec, profitDec }) => ({ borrowedDec: new bignumber_js_1.default(borrowedDec), profitDec }));
};
exports.formatPathsToDeals = formatPathsToDeals;
const findMostProfitableDeal = (deals) => deals.reduce((a, b) => (a.profitDec.gt(b.profitDec) ? a : b));
exports.findMostProfitableDeal = findMostProfitableDeal;
// We do maximum variation of 80%
const safeIncrement = (increment) => (increment > 0.8 ? 0.8 : increment);
const safeBigNumber = (dec) => new bignumber_js_1.default(dec.toFixed(0));
const calculateNextBorrowingStrategy = ({ dealsLength, bestDealIndex, bestDeal: { borrowedDec }, currentIncrement, baseIncrement, }) => {
    const isBestDealOnExtremities = bestDealIndex === 0 || bestDealIndex + 1 === dealsLength;
    const indexOfMiddleValue = (dealsLength - 1) / 2;
    // If best profit is on one of extremities, we focus on it
    if (isBestDealOnExtremities) {
        console.log('Deal was found on extremities');
        return {
            nextBorrowingStrategy: [
                safeBigNumber(borrowedDec.multipliedBy(1 - safeIncrement(currentIncrement * 2))),
                safeBigNumber(borrowedDec.multipliedBy(1 - safeIncrement(currentIncrement))),
                safeBigNumber(borrowedDec),
                safeBigNumber(borrowedDec.multipliedBy(1 + safeIncrement(currentIncrement))),
                safeBigNumber(borrowedDec.multipliedBy(1 + safeIncrement(currentIncrement * 2))), // eg: -40%
            ],
            // We multiply nextIncrement by two, so the scale grows bigger each round until we found the right value
            nextIncrement: safeIncrement(currentIncrement * 2),
        };
    }
    // If best profit is on inner value, focus on it by keeping currentIncrement === baseIncrement
    if (bestDealIndex !== indexOfMiddleValue) {
        console.log('Deal was found on inner value');
        return {
            nextBorrowingStrategy: [
                safeBigNumber(borrowedDec.multipliedBy(1 - safeIncrement(currentIncrement * 2))),
                safeBigNumber(borrowedDec.multipliedBy(1 - safeIncrement(currentIncrement))),
                safeBigNumber(borrowedDec),
                safeBigNumber(borrowedDec.multipliedBy(1 + safeIncrement(currentIncrement))),
                safeBigNumber(borrowedDec.multipliedBy(1 + safeIncrement(currentIncrement * 2))), // eg: -40%
            ],
            // We reset the nextIncrement to baseIncrement
            nextIncrement: baseIncrement,
        };
    }
    console.log('Deal was found at the center of the results');
    // if central value is the best one, stay on it and widen extremity to 5 times baseIncrement and borders to only baseIncrement
    return {
        nextBorrowingStrategy: [
            safeBigNumber(borrowedDec.multipliedBy(1 - safeIncrement(currentIncrement * 4))),
            safeBigNumber(borrowedDec.multipliedBy(1 - safeIncrement(currentIncrement))),
            safeBigNumber(borrowedDec),
            safeBigNumber(borrowedDec.multipliedBy(1 + safeIncrement(currentIncrement))),
            safeBigNumber(borrowedDec.multipliedBy(1 + safeIncrement(currentIncrement * 4))), // eg: -40%
        ],
        // We reset the nextIncrement to baseIncrement
        nextIncrement: baseIncrement,
    };
};
exports.calculateNextBorrowingStrategy = calculateNextBorrowingStrategy;
//# sourceMappingURL=utils.js.map