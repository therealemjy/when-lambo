import AWSWebsocketProvider from '@aws/web3-ws-provider';
import 'console.table';
import { ethers } from 'ethers';
import { GoogleSpreadsheet } from 'google-spreadsheet';

import { Token } from '@src/types';

import './@moduleAliases';
import config from './src/config';
import BancorExchange from './src/exchanges/bancor';
import KyberExchange from './src/exchanges/kyber';
import SushiswapExchange from './src/exchanges/sushiswap';
import UniswapV2Exchange from './src/exchanges/uniswapV2';
import gasPriceWatcher from './src/gasPriceWatcher';
import logPaths from './src/logPaths';
import monitorPrices from './src/monitorPrices';
import { WETH } from './src/tokens';

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
const bancorExchangeService = new BancorExchange(provider);

const tradedToken: Token = {
  symbol: config.tradedToken.symbol,
  address: config.tradedToken.address,
  decimals: config.tradedToken.decimals,
};

const SPREAD_SHEET_TITLE = `WETH / ${tradedToken.symbol}`;

let isMonitoring = false;

const init = async () => {
  // Init exchanges that need to call asynchronous functions to get initialized
  await bancorExchangeService.init();

  // Initialize Google Spreadsheet intance
  const spreadsheet = new GoogleSpreadsheet(config.googleSpreadSheet.worksheetId);

  await spreadsheet.useServiceAccountAuth({
    client_email: config.googleSpreadSheet.clientEmail,
    private_key: Buffer.from(config.googleSpreadSheet.privateKeyBase64, 'base64').toString('ascii'),
  });
  await spreadsheet.loadInfo();

  const worksheet = spreadsheet.sheetsByTitle[SPREAD_SHEET_TITLE];

  if (!worksheet) {
    throw new Error(
      `Worksheet "${SPREAD_SHEET_TITLE}" does not exist on spreadsheet "${spreadsheet.title}" (ID: ${config.googleSpreadSheet.worksheetId}). Create it then start the bot again.`
    );
  }

  // Pull gas prices every 5 seconds
  gasPriceWatcher.updateEvery(5000);

  console.log('Price monitoring has started.');

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
      refTokenDecimalAmounts: config.tradedToken.weiAmounts,
      refToken: WETH,
      tradedToken,
      exchanges: [uniswapV2ExchangeService, sushiswapExchangeService, kyberExchangeService],
      slippageAllowancePercent: config.slippageAllowancePercent,
      gasPriceWei: global.currentGasPrices.rapid,
    });

    isMonitoring = false;

    if (config.environment === 'development') {
      console.timeEnd('monitorPrices');
    }

    logPaths(paths, worksheet);
  });
};

init();
