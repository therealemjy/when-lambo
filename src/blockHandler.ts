import { Multicall } from '@maxime.julian/ethereum-multicall';

import config from './config';
import eventEmitter from './eventEmitter';
import findBestPaths from './findBestPaths';
import logger from './logger';
import { WETH } from './tokens';
import { Exchange } from './types';

const blockHandler = (multicall: Multicall, exchanges: Exchange[]) => async (blockNumber: string) => {
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

  try {
    const paths = await findBestPaths({
      multicall,
      fromTokenDecimalAmounts: config.toToken.weiAmounts,
      fromToken: WETH,
      toToken: {
        symbol: config.toToken.symbol,
        address: config.toToken.address,
        decimals: config.toToken.decimals,
      },
      exchanges,
      slippageAllowancePercent: config.slippageAllowancePercent,
      gasPriceWei: global.currentGasPrices.rapid,
    });

    eventEmitter.emit('paths', paths);
  } catch (err: unknown) {
    eventEmitter.emit('error', err);
  } finally {
    if (config.isDev) {
      console.timeEnd('monitorPrices');
    }

    // Reset monitoring status so the script doesn't stop
    global.isMonitoring = false;
  }
};

export default blockHandler;
