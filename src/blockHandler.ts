import { Multicall } from '@maxime.julian/ethereum-multicall';
import { GoogleSpreadsheetWorksheet } from 'google-spreadsheet';

import config from './config';
import eventEmitter from './eventEmitter';
import findBestPaths from './findBestPaths';
import logger from './logger';
import { WETH } from './tokens';
import { Exchange, Strategy } from './types';

const executeStrategy = async ({
  multicall,
  strategy,
  exchanges,
  worksheet,
}: {
  multicall: Multicall;
  strategy: Strategy;
  exchanges: Exchange[];
  worksheet: GoogleSpreadsheetWorksheet;
}) => {
  try {
    const paths = await findBestPaths({
      multicall,
      fromTokenDecimalAmounts: strategy.toToken.weiAmounts,
      fromToken: WETH,
      toToken: {
        symbol: strategy.toToken.symbol,
        address: strategy.toToken.address,
        decimals: strategy.toToken.decimals,
      },
      exchanges,
      slippageAllowancePercent: config.slippageAllowancePercent,
      gasPriceWei: global.currentGasPrices.rapid,
    });

    eventEmitter.emit('paths', paths, worksheet);
  } catch (error: unknown) {
    eventEmitter.emit('error', error);
  }
};

const blockHandler =
  ({
    multicall,
    worksheets,
    exchanges,
  }: {
    multicall: Multicall;
    worksheets: GoogleSpreadsheetWorksheet[];
    exchanges: Exchange[];
  }) =>
  async (blockNumber: string) => {
    if (config.isDev) {
      logger.log(`New block received. Block # ${blockNumber}`);
    }

    if (global.isMonitoring && config.isDev) {
      logger.log('Block skipped! Price monitoring ongoing.');
    } else if (config.isDev) {
      console.time('monitorPrices');
    }

    // Check script isn't currently running
    if (global.isMonitoring) {
      return;
    }

    global.isMonitoring = true;

    // Execute all strategies simultaneously
    await Promise.all(
      config.strategies.map((strategy) =>
        executeStrategy({
          multicall,
          strategy,
          exchanges,
          worksheet: worksheets.find((worksheet) => worksheet.sheetId === strategy.googleSpreadSheetId)!,
        })
      )
    );

    if (config.isDev) {
      console.timeEnd('monitorPrices');
    }

    // Reset monitoring status so the script doesn't stop
    global.isMonitoring = false;
  };

export default blockHandler;
