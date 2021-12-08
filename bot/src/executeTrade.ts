import BigNumber from 'bignumber.js';
import { ContractTransaction } from 'ethers';

import { TRANSACTOR_TRADE_WITHOUT_SWAPS_GAS_ESTIMATE } from '@constants';
import logger from '@logger';

import { Transactor as ITransactorContract } from '@chainHandler/typechain';

import { Path } from '@bot/src/types';

const executeTrade = async ({
  blockNumber,
  path,
  gasPriceWei,
  gasLimitMultiplicator,
  TransactorContract,
}: {
  blockNumber: number;
  path: Path;
  gasPriceWei: BigNumber;
  gasLimitMultiplicator: number;
  TransactorContract: ITransactorContract;
}): Promise<ContractTransaction> => {
  const expectedBlockNumber = blockNumber + 1;

  const wethAmountToBorrow = path[0].fromTokenDecimalAmount;
  const sellingExchangeIndex = path[0].exchangeIndex;
  const tradedTokenAddress = path[0].toToken.address;
  const tradedTokenAmountOutMin = path[0].toTokenDecimalAmount;

  const buyingExchangeIndex = path[1].exchangeIndex;
  const wethAmountOutMin = path[1].toTokenDecimalAmount;
  // Set a deadline that's 1 hour from now. This is mostly irrelevant anyway since we need
  // our transaction to be executed in much less time than that (the contract has an internal
  // safe guard anyway to make sure the transaction is only mined for a given block number)
  const deadline = new Date(new Date().getTime() + 3600000).getTime();

  // Add up gas estimates to obtain the expected gas needed to execute the transaction, then
  // multiple by the gas limit multiplicator we defined to obtain the gas limit
  const gasLimit = path[0].gasEstimate
    .plus(path[1].gasEstimate)
    .plus(TRANSACTOR_TRADE_WITHOUT_SWAPS_GAS_ESTIMATE)
    .multipliedBy(gasLimitMultiplicator);

  const args: Parameters<ITransactorContract['trade']> = [
    expectedBlockNumber,
    wethAmountToBorrow.toFixed(0),
    sellingExchangeIndex,
    tradedTokenAddress,
    tradedTokenAmountOutMin.toFixed(0),
    buyingExchangeIndex,
    wethAmountOutMin.toFixed(0),
    deadline,
    { gasPrice: gasPriceWei.toFixed(0), gasLimit: gasLimit.toFixed(0) },
  ];

  logger.log('Sending trade transaction...', args);
  const transaction = await TransactorContract.trade(...args);
  logger.log(`Transaction sent. Hash: ${transaction.hash}`);

  return transaction;
};

export default executeTrade;
