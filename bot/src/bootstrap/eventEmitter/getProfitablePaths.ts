/*
Rules for a trade to be counted as profitable:
1) Trade musts yield a profit that's equal or superior the total gas cost of the transaction
2) Total gas cost of the transaction can only go up to 0.043 ETH maximum
*/
import { Path } from '@bot/src/types';

const getProfitablePaths = (paths: Path[]) => {
  return [];
};

export default getProfitablePaths;
