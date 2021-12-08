import { BigNumber } from 'ethers';

const calculateProfit = ({
  revenueDec,
  expenseDec,
}: {
  revenueDec: BigNumber;
  expenseDec: BigNumber;
}): [BigNumber, string] => {
  const profitDec = revenueDec.sub(expenseDec);
  // TODO: check
  const profitPercent = profitDec.div(revenueDec).mul(100).toString();

  return [profitDec, profitPercent];
};

export default calculateProfit;
