import { BigNumber } from 'ethers';

const calculateProfit = ({
  revenueDec,
  expenseDec,
}: {
  revenueDec: BigNumber;
  expenseDec: BigNumber;
}): [BigNumber, number] => {
  const profitDec = revenueDec.sub(expenseDec);
  // Express the percentage with 2 decimal places
  const profitPercent = profitDec.mul(10000).div(revenueDec).toNumber() / 100;

  return [profitDec, profitPercent];
};

export default calculateProfit;
