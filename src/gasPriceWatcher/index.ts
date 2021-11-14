import axios from 'axios';
import BigNumber from 'bignumber.js';

import config from '@src/config';
import eventEmitter from '@src/eventEmitter';

class GasPriceWatcher {
  constructor() {
    console.log('Gas price watcher started.');
    this.getPrices();
  }

  public async updateEvery(interval: number) {
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
