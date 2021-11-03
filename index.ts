import AWSWebsocketProvider from '@aws/web3-ws-provider';
import BigNumber from 'bignumber.js';
import 'console.table';
import { ethers } from 'ethers';

import './@moduleAliases';
import config from './src/config';
import KyberExchange from './src/exchanges/kyber';
import SushiswapExchange from './src/exchanges/sushiswap';
import UniswapV2Exchange from './src/exchanges/uniswapV2';
import gasPriceWatcher from './src/gasPriceWatcher';
import logPaths from './src/logPaths';
import monitorPrices from './src/monitorPrices';
import { WETH, MANA } from './src/tokens';

const provider = new ethers.providers.Web3Provider(
  new AWSWebsocketProvider(config.aws.wsRpcUrl, {
    clientConfig: {
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    },
  })
);

// Instantiate exchange services
const uniswapV2ExchangeService = new UniswapV2Exchange(provider);
const sushiswapExchangeService = new SushiswapExchange(provider);
const kyberExchangeService = new KyberExchange(provider);

// TODO: use environment variables for this
const WETH_DECIMALS_AMOUNT = '1000000000000000000'; // One WETH in decimals

let isMonitoring = false;

const init = async () => {
  // Pull gas prices every 5 seconds
  gasPriceWatcher.updateEvery(5000);

  const borrowedWethDecimalAmounts = [
    new BigNumber(WETH_DECIMALS_AMOUNT), // 1 WETH
    new BigNumber(WETH_DECIMALS_AMOUNT).multipliedBy(5), // 5 WETH
    new BigNumber(WETH_DECIMALS_AMOUNT).multipliedBy(10), // 10 WETH
    new BigNumber(WETH_DECIMALS_AMOUNT).multipliedBy(20), // 10 WETH
    new BigNumber(WETH_DECIMALS_AMOUNT).multipliedBy(30), // 10 WETH
  ];

  provider.addListener('block', async (blockNumber) => {
    if (config.environment === 'development') {
      console.log(`New block received. Block # ${blockNumber}`);
    }

    if (isMonitoring && config.environment === 'development') {
      console.log('Block skipped! Price monitoring ongoing.');
    } else if (config.environment === 'development') {
      console.time('monitorPrices');
    }

    if (isMonitoring) {
      return;
    }

    isMonitoring = true;

    const paths = await monitorPrices({
      refTokenDecimalAmounts: borrowedWethDecimalAmounts,
      refToken: WETH,
      tradedToken: MANA,
      exchanges: [uniswapV2ExchangeService, sushiswapExchangeService, kyberExchangeService],
      slippageAllowancePercent: config.slippageAllowancePercent,
      gasPriceWei: global.currentGasPrices.rapid,
    });

    isMonitoring = false;

    logPaths(paths);

    if (config.environment === 'development') {
      console.timeEnd('monitorPrices');
    }
  });
};

init();
