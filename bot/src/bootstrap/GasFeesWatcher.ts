import axios from 'axios';
import { BigNumber } from 'ethers';

import { Services } from '.';

export interface GasFees {
  maxPriorityFeePerGas: BigNumber;
  maxFeePerGas: BigNumber;
}

class GasFeesWatcher {
  blocknativeApiKey: string;

  constructor(blocknativeApiKey: string) {
    this.blocknativeApiKey = blocknativeApiKey;
  }

  public async start(services: Services, callback: (gasFees: GasFees) => void, interval: number) {
    this.blocknativeApiKey = services.config.blocknativeApiKey;

    const fn = async () => {
      const prices = await this.getPrices(services);
      callback(prices);
    };

    await fn();

    services.logger.log('Gas price watcher started.');
    setInterval(fn, interval);
  }

  private convertGweiNumberToWei(gwei: number) {
    // Because BigNumber does not support decimal numbers, we need to convert
    // gwei values expressed with decimal numbers into wei using a normal
    // calculation
    return Math.ceil(gwei * 10 ** 9);
  }

  private async getPrices(services: Services): Promise<GasFees> {
    const res = await axios.get<{
      system: string;
      network: string;
      unit: string;
      maxPrice: number;
      currentBlockNumber: number;
      msSinceLastBlock: number;
      blockPrices: [
        {
          blockNumber: number;
          baseFeePerGas: number;
          estimatedTransactionCount: number;
          estimatedPrices: [
            {
              confidence: number;
              price: number;
              maxPriorityFeePerGas: number;
              maxFeePerGas: number;
            }
          ];
        }
      ];
    }>('https://api.blocknative.com/gasprices/blockprices?confidenceLevels=99', {
      headers: {
        Authorization: this.blocknativeApiKey,
      },
    });

    const pendingBlock = res.data.blockPrices[0];
    const baseFeePerGas = pendingBlock.baseFeePerGas;

    if (res.data.unit !== 'gwei') {
      throw new Error(
        `blocknative have changed the unit of the gas fees their API returns. New unit: ${res.data.unit}. We are currently working with gwei,`
      );
    }

    const maxPriorityFeePerGas = BigNumber.from(
      this.convertGweiNumberToWei(pendingBlock.estimatedPrices[0].maxPriorityFeePerGas)
    )
      // In order to make sure transactions are mined as fast as possible, we
      // multiply the max priority fee per gas returned by blocknative by a given
      // multiplicator set in config
      .mul(Math.floor(services.config.maxPriorityFeePerGasMultiplicator * 100))
      .div(100);

    const maxFeePerGas = maxPriorityFeePerGas.add(this.convertGweiNumberToWei(baseFeePerGas));

    return {
      maxPriorityFeePerGas,
      maxFeePerGas,
    };
  }
}

export default GasFeesWatcher;
