import axios from 'axios';
import BigNumber from 'bignumber.js';

import { Services } from '..';

export interface GasPrices {
  rapid: BigNumber;
  fast: BigNumber;
  standard: BigNumber;
  slow: BigNumber;
}

class GasPriceWatcher {
  public async start(services: Services, callback: (gasPrices: GasPrices) => void, interval: number) {
    const fn = async () => {
      const prices = await this.getPrices(services);
      callback(prices);
    };

    await fn();

    services.logger.log('Gas price watcher started.');
    setInterval(fn, interval);
  }

  private async getPrices(services: Services): Promise<GasPrices> {
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
      rapid: new BigNumber(res.data.data.rapid).multipliedBy(services.config.gasPriceMultiplicator),
      fast: new BigNumber(res.data.data.fast),
      standard: new BigNumber(res.data.data.standard),
      slow: new BigNumber(res.data.data.slow),
    };
  }
}

export default new GasPriceWatcher();
