import AWSWebsocketProvider from '@aws/web3-ws-provider';
import { Multicall } from '@maxime.julian/ethereum-multicall';
import 'console.table';
import { ethers } from 'ethers';
import { GoogleSpreadsheet } from 'google-spreadsheet';

import './@moduleAliases';
import config from './src/config';
import CryptoComExchange from './src/exchanges/cryptoCom';
import KyberExchange from './src/exchanges/kyber';
import SushiswapExchange from './src/exchanges/sushiswap';
import UniswapV2Exchange from './src/exchanges/uniswapV2';
import findBestPaths from './src/findBestPaths';
import gasPriceWatcher from './src/gasPriceWatcher';
import logPaths from './src/logPaths';
import { WETH } from './src/tokens';

const THIRTY_MINUTES_IN_MILLISECONDS = 1000 * 60 * 30;

let isMonitoring = false;

const getWorksheet = async () => {
  // Initialize Google Spreadsheet instance
  const spreadsheet = new GoogleSpreadsheet(config.googleSpreadSheet.worksheetId);

  await spreadsheet.useServiceAccountAuth({
    client_email: config.googleSpreadSheet.clientEmail,
    private_key: Buffer.from(config.googleSpreadSheet.privateKeyBase64, 'base64').toString('ascii'),
  });
  await spreadsheet.loadInfo();

  return spreadsheet.sheetsByIndex[0];
};

const init = async () => {
  const worksheet = await getWorksheet();

  // Pull gas prices every 5 seconds
  gasPriceWatcher.updateEvery(5000);

  const start = () => {
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

    const multicall = new Multicall({ ethersProvider: provider, tryAggregate: true });

    // Instantiate exchange services
    const uniswapV2ExchangeService = new UniswapV2Exchange();
    const sushiswapExchangeService = new SushiswapExchange();
    const kyberExchangeService = new KyberExchange();
    const cryptoComExchangeService = new CryptoComExchange();

    const onReceiveBlock = async (blockNumber: string) => {
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

      const paths = await findBestPaths({
        multicall,
        refTokenDecimalAmounts: config.tradedToken.weiAmounts,
        refToken: WETH,
        tradedToken: {
          symbol: config.tradedToken.symbol,
          address: config.tradedToken.address,
          decimals: config.tradedToken.decimals,
        },
        exchanges: [uniswapV2ExchangeService, sushiswapExchangeService, kyberExchangeService, cryptoComExchangeService],
        slippageAllowancePercent: config.slippageAllowancePercent,
        gasPriceWei: global.currentGasPrices.rapid,
      });

      isMonitoring = false;

      if (config.environment === 'development') {
        console.timeEnd('monitorPrices');
      }

      logPaths(paths, worksheet);
    };

    provider.addListener('block', onReceiveBlock);

    console.log('Price monitoring bot started.');

    // Regularly restart the bot so the websocket connection doesn't idle
    setTimeout(() => {
      console.log('Restarting bot...');

      // Shut down bot
      provider.removeAllListeners();

      start();
    }, THIRTY_MINUTES_IN_MILLISECONDS);
  };

  // Start bot
  start();
};

init();
