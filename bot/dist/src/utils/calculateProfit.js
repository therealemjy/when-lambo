"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const calculateProfit = ({ revenueDec, expenseDec, }) => {
    const profitDec = revenueDec.minus(expenseDec);
    const profitPercent = profitDec.dividedBy(revenueDec.toFixed(0)).multipliedBy(100).toFixed(2);
    return [profitDec, profitPercent];
};
exports.default = calculateProfit;
//# sourceMappingURL=calculateProfit.js.map