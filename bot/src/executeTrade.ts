import { ContractTransaction } from 'ethers';

import logger from '@logger';

import { Transactor as ITransactorContract } from '@chainHandler/typechain';

import { Trade } from '@bot/src/types';

const executeTrade = async ({
  trade,
  TransactorContract,
}: {
  trade: Trade;
  TransactorContract: ITransactorContract;
}): Promise<ContractTransaction> => {
  const wethAmountToBorrow = trade.path[0].fromTokenDecimalAmount;
  const sellingExchangeIndex = trade.path[0].exchangeIndex;
  const tradedTokenAddress = trade.path[0].toToken.address;
  const tradedTokenAmountOutMin = trade.path[0].toTokenDecimalAmount;

  const buyingExchangeIndex = trade.path[1].exchangeIndex;
  const wethAmountOutMin = trade.path[1].toTokenDecimalAmount;
  // Set a deadline that's 10 minutes from now. This is mostly irrelevant anyway since we need
  // our transaction to be executed in much less time than that (the contract has an internal
  // safe guard anyway to make sure the transaction is only mined for a given block number)
  const deadline = new Date(new Date().getTime() + 600000).getTime();

  const args: Parameters<ITransactorContract['trade']> = [
    trade.blockNumber,
    wethAmountToBorrow,
    sellingExchangeIndex,
    tradedTokenAddress,
    tradedTokenAmountOutMin,
    buyingExchangeIndex,
    wethAmountOutMin,
    deadline,
    trade.gasSettings,
  ];

  logger.log('Sending trade transaction...', args);
  const transaction = await TransactorContract.trade(...args);
  logger.log(`Transaction sent. Hash: ${transaction.hash}`);

  return transaction;
};

export default executeTrade;
