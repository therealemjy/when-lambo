import BigNumber from 'bignumber.js';

const calculateProfit = (revenueDec: BigNumber, expenseDec: BigNumber): [BigNumber, string] => {
  const profitDec = revenueDec.minus(expenseDec);
  const profitPercent = profitDec.dividedBy(revenueDec.toFixed(0)).multipliedBy(100).toFixed(2);

  return [profitDec, profitPercent];
};

export default calculateProfit;
