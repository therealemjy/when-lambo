"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const ethers_1 = require("ethers");
const utils_1 = require("./utils");
class BorrowerAdjuster {
    constructor() {
        console.log('Borrower adjuster started.');
    }
    start(initialValues, baseIncrement) {
        this.currentIncrement = baseIncrement;
        this.baseIncrement = baseIncrement;
        global.currentBorrowingStrategy = initialValues;
    }
    registerNewPaths(paths) {
        const currentDeals = paths.map(({ profitDec, borrowedDec }) => ({
            borrowedDec: new bignumber_js_1.default(borrowedDec),
            profitDec,
        }));
        // First pass of the algorithm, register first deals
        if (!this.previousDeals) {
            this.previousDeals = (0, utils_1.formatPathsToDeals)(paths);
            return;
        }
        // find best profit among current deals
        const dealsLength = currentDeals.length;
        const bestDeal = (0, utils_1.findMostProfitableDeal)(currentDeals);
        const bestDealIndex = currentDeals.indexOf(bestDeal);
        console.log('________________________________________________________________________________________________________________');
        console.log('Current borrowed strategy: ', currentDeals.map((deal) => ethers_1.ethers.utils.formatEther(deal.borrowedDec.toString())));
        console.log('Best deal: ', {
            borrowed: ethers_1.ethers.utils.formatEther(bestDeal.borrowedDec.toString()),
            profit: ethers_1.ethers.utils.formatEther(bestDeal.profitDec.toString()),
        });
        console.log('Best deal index', bestDealIndex);
        console.log('Current increment', this.currentIncrement);
        const { nextBorrowingStrategy, nextIncrement } = (0, utils_1.calculateNextBorrowingStrategy)({
            dealsLength,
            bestDealIndex,
            bestDeal,
            currentIncrement: this.currentIncrement,
            baseIncrement: this.baseIncrement,
        });
        console.log('Next Borrowing Strategy: ', nextBorrowingStrategy.map((deal) => ethers_1.ethers.utils.formatEther(deal.toString())));
        console.log('Next increment', nextIncrement);
        // We register de the value for the next increment
        this.currentIncrement = nextIncrement;
        this.previousDeals = currentDeals;
        global.currentBorrowingStrategy = nextBorrowingStrategy;
    }
}
exports.default = new BorrowerAdjuster();
//# sourceMappingURL=index.js.map