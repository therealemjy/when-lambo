import BigNumber from 'bignumber.js';
import { GoogleSpreadsheet } from 'google-spreadsheet';

import { TRADE_WITHOUT_SWAPS_GAS_ESTIMATE } from '@constants';
import logger from '@logger';

import { Transactor as ITransactorContract } from '@chainHandler/typechain';

import { Path } from '@bot/src/types';

const executeTrade = async ({
  blockNumber,
  path,
  gasPriceWei,
  gasLimitMultiplicator,
  spreadsheet,
  TransactorContract,
}: {
  blockNumber: string;
  path: Path;
  gasPriceWei: BigNumber;
  gasLimitMultiplicator: number;
  spreadsheet: GoogleSpreadsheet;
  TransactorContract: ITransactorContract;
}) => {
  logger.log('Sending trade transaction...');

  const expectedBlockNumber = blockNumber + 1;
  const wethAmountToBorrow = path[0].fromTokenDecimalAmount;
  const sellingExchangeIndex = path[0].exchangeIndex;
  const tradeTokenAddress = path[0].toToken.address;
  const tradedTokenAmountOutMin = path[0].toTokenDecimalAmount;
  const buyingExchangeIndex = path[1].exchangeIndex;
  const wethAmountOutMin = path[1].toTokenDecimalAmount;
  // Set a deadline that's 1 minute from now. This is mostly irrelevant anyway since we need
  // our transaction to be executed in much less time than that (the contract has an internal
  // safe guard anyway to make sure the transaction is only mined for a given block number)
  const deadline = new Date(new Date().getTime() + 60000).getTime();

  // Add up gas estimates to obtain the expected gas needed to execute the transaction, then
  // multiple by the gas limit multiplicator we defined to obtain the gas limt
  const gasLimit = path[0].gasEstimate
    .plus(path[1].gasEstimate)
    .plus(TRADE_WITHOUT_SWAPS_GAS_ESTIMATE)
    .multipliedBy(gasLimitMultiplicator);

  const transaction = await TransactorContract.trade(
    expectedBlockNumber,
    wethAmountToBorrow.toFixed(),
    sellingExchangeIndex,
    tradeTokenAddress,
    tradedTokenAmountOutMin.toFixed(),
    buyingExchangeIndex,
    wethAmountOutMin.toFixed(),
    deadline,
    { gasPrice: gasPriceWei.toFixed(), gasLimit: gasLimit.toFixed() }
  );

  logger.log(`Transaction sent! Hash: ${transaction.hash}`);

  await logger.transaction({ blockNumber, path, transactionHash: transaction.hash, spreadsheet });
};

export default executeTrade;
