import { GoogleSpreadsheet } from 'google-spreadsheet';

import logger from '@logger';

import { Transactor as ITransactorContract } from '@chainHandler/typechain';

import { Path } from '@bot/src/types';

const executeTrade = async ({
  blockNumber,
  path,
  spreadsheet,
}: {
  blockNumber: string;
  path: Path;
  spreadsheet: GoogleSpreadsheet;
  TransactorContract: ITransactorContract;
}) => {
  // TODO: call contract

  logger.path(blockNumber, path, spreadsheet);

  // TODO: exit process
};

export default executeTrade;
