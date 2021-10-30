import AWSWebsocketProvider from '@aws/web3-ws-provider';
import BigNumber from 'bignumber.js';
import 'console.table';
import { ethers } from 'ethers';

import './@moduleAliases';
import config from './src/config';
import KyberExchange from './src/exchanges/kyber';
import SushiswapExchange from './src/exchanges/sushiswap';
import UniswapV2Exchange from './src/exchanges/uniswapV2';
import monitorPrices from './src/monitorPrices';
import { WETH, DAI } from './src/tokens';

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

const init = async () => {
  const borrowedWethDecimalAmounts = [
    new BigNumber(WETH_DECIMALS_AMOUNT), // 1 WETH
    new BigNumber(WETH_DECIMALS_AMOUNT).multipliedBy(5), // 5 WETH
    new BigNumber(WETH_DECIMALS_AMOUNT).multipliedBy(10), // 10 WETH
  ];

  provider.addListener('block', async (blockNumber) => {
    console.time('monitorPrices');
    console.log(`New block received. Block # ${blockNumber}`);

    await monitorPrices(
      {
        refTokenDecimalAmounts: borrowedWethDecimalAmounts,
        refToken: WETH,
        tradedToken: DAI,
      },
      [
        { name: 'Uniswap V2', service: uniswapV2ExchangeService },
        { name: 'Sushiswap', service: sushiswapExchangeService },
        { name: 'Kyber', service: kyberExchangeService },
      ]
    );

    console.timeEnd('monitorPrices');
  });
};

init();
