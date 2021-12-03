import axios from 'axios';
import BigNumber from 'bignumber.js';

import eventEmitter from '@src/bootstrap/eventEmitter';
import logger from '@src/bootstrap/logger';
import config from '@src/config';

class GasPriceWatcher {
  constructor() {
    this.getPrices();
  }

  public start(interval: number) {
    logger.log('Gas price watcher started.');
    setInterval(this.getPrices, interval);
  }

  private async getPrices() {
    try {
      const res = await axios.get<{
        data: {
          rapid: BigNumber;
          fast: BigNumber;
          standard: BigNumber;
          slow: BigNumber;
        };
      }>('https://etherchain.org/api/gasnow');

      global.currentGasPrices = {
        // In order to make sure transactions are mined as fast as possible, we
        // multiply the gas price for rapid transactions by a given
        // multiplicator
        rapid: new BigNumber(res.data.data.rapid).multipliedBy(config.gasPriceMultiplicator),
        fast: new BigNumber(res.data.data.fast),
        standard: new BigNumber(res.data.data.standard),
        slow: new BigNumber(res.data.data.slow),
      };
    } catch (err: unknown) {
      eventEmitter.emit('error', err);
    }
  }
}

export default new GasPriceWatcher();
