import axios from 'axios';

class GasPriceWatcher {
  constructor() {
    console.log('⛽️ Gas price watcher has started');
    this.getPrices();
  }

  public async updateEvery(interval: number) {
    setInterval(this.getPrices, interval);
  }

  private async getPrices() {
    try {
      const res = await axios.get<{
        data: {
          rapid: number;
          fast: number;
          standard: number;
          slow: number;
        };
      }>('https://etherchain.org/api/gasnow');

      global.currentGasPrices = {
        rapid: res.data.data.rapid,
        fast: res.data.data.fast,
        standard: res.data.data.standard,
        slow: res.data.data.slow,
      };
    } catch (err) {
      console.log('Error while pulling data from gasnow', err);
    }
  }
}

export default new GasPriceWatcher();
