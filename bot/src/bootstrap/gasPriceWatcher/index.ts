import axios from 'axios';
import BigNumber from 'bignumber.js';

import config from '@config';
import logger from '@logger';

import { Services } from '@bot/src/bootstrap';
import eventEmitter from '@bot/src/bootstrap/eventEmitter';

class GasPriceWatcher {
  public start(services: Services, interval: number) {
    logger.log('Gas price watcher started.');
    setInterval(() => this.getPrices(services), interval);
  }

  private async getPrices(services: Services) {
    try {
      const res = await axios.get<{
        data: {
          rapid: BigNumber;
          fast: BigNumber;
          standard: BigNumber;
          slow: BigNumber;
        };
      }>('https://etherchain.org/api/gasnow');

      services.state.currentGasPrices = {
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
