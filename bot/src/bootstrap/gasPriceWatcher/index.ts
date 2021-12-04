import axios from 'axios';
import BigNumber from 'bignumber.js';

import config from '@config';
import logger from '@logger';

export interface GasPrices {
  rapid: BigNumber;
  fast: BigNumber;
  standard: BigNumber;
  slow: BigNumber;
}

class GasPriceWatcher {
  public async start(callback: (gasPrices: GasPrices) => void, interval: number) {
    const fn = async () => {
      const prices = await this.getPrices();
      callback(prices);
    };

    await fn();

    logger.log('Gas price watcher started.');
    setInterval(fn, interval);
  }

  private async getPrices(): Promise<GasPrices> {
    const res = await axios.get<{
      data: {
        rapid: BigNumber;
        fast: BigNumber;
        standard: BigNumber;
        slow: BigNumber;
      };
    }>('https://etherchain.org/api/gasnow');

    return {
      // In order to make sure transactions are mined as fast as possible, we
      // multiply the gas price for rapid transactions by a given
      // multiplicator
      rapid: new BigNumber(res.data.data.rapid).multipliedBy(config.gasPriceMultiplicator),
      fast: new BigNumber(res.data.data.fast),
      standard: new BigNumber(res.data.data.standard),
      slow: new BigNumber(res.data.data.slow),
    };
  }
}

export default new GasPriceWatcher();
