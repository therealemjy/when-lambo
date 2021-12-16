import axios from 'axios';

import { GasFees } from '@localTypes';
import logger from '@logger';

class GasFeesWatcher {
  blocknativeApiKey: string;
  maxPriorityFeePerGasMultiplicator: number;

  constructor(blocknativeApiKey: string, maxPriorityFeePerGasMultiplicator: number) {
    this.blocknativeApiKey = blocknativeApiKey;
    this.maxPriorityFeePerGasMultiplicator = maxPriorityFeePerGasMultiplicator;
  }

  public async start(callback: (gasFees: GasFees) => void, interval: number) {
    const fn = async () => {
      try {
        const prices = await this.getGasFees();
        callback(prices);
      } catch (error) {
        logger.error(error);
      }
    };

    await fn();

    logger.log('Gas fees watcher started.');
    setInterval(fn, interval);
  }

  private convertGweiNumberToWei(gwei: number) {
    return Math.ceil(gwei * 10 ** 9);
  }

  public async getGasFees(): Promise<GasFees> {
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

    const maxPriorityFeePerGasWei = this.convertGweiNumberToWei(pendingBlock.estimatedPrices[0].maxPriorityFeePerGas);

    // In order to make sure transactions are mined as fast as possible, we
    // multiply the max priority fee per gas returned by blocknative by a given
    // multiplicator set in config
    const maxPriorityFeePerGas = Math.floor(maxPriorityFeePerGasWei * this.maxPriorityFeePerGasMultiplicator);
    const baseFeePerGasWei = this.convertGweiNumberToWei(baseFeePerGas);
    const maxFeePerGas = parseInt(baseFeePerGasWei as any) + parseInt(maxPriorityFeePerGas as any);

    return {
      maxPriorityFeePerGas,
      maxFeePerGas,
    };
  }
}

export default GasFeesWatcher;
