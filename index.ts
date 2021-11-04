import AWSWebsocketProvider from '@aws/web3-ws-provider';
import 'console.table';
import { ethers } from 'ethers';
import { GoogleSpreadsheet } from 'google-spreadsheet';

import { Token } from '@src/types';

import './@moduleAliases';
import config from './src/config';
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

const tradedToken: Token = {
  symbol: config.tradedToken.symbol,
  address: config.tradedToken.address,
  decimals: config.tradedToken.decimals,
};

let isMonitoring = false;

const init = async () => {
  // Initialize Google Spreadsheet intance
  // TODO: use env variable
  const spreadsheet = new GoogleSpreadsheet('1ka3JbjlSSjNnvwLhJ11c-mKwK2TJ622_elG9evOf4JI');

  // TODO: use env variables
  await spreadsheet.useServiceAccountAuth({
    client_email: 'log-bot@when-lambo-331122.iam.gserviceaccount.com',
    private_key:
      '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDfXp9b3qpxPXrZ\nQ4lt0KBQHC89YeGFC0CqV+SIihZBGkLgpJAkLb5pq/GNUIDQrkxaRihce7Kd5QuR\n4L8AVabLUpf5o/DMbwLHDsY1e4Jcoo/OEKmlIVSvUeJnlOOFt7PqVEc7PrN2O2B+\n5HBJFId0IfTj5Ujs8HUUCnwocKn2Wk2dZZICie7aaBMYj5Pp9rOY0JXHsphnUthP\nmFp0lgZA2QZLd2D/gbNuwaZep8LnEKFQNA5JrLUbFBhAhaMWk+lD1vks825WW8od\nWVmqynMWIbP9hUXTNaB5bt06120t+v9b3wXREWkKWNzk8JftDbIR61DOeNv99bWC\nrpbI6EtRAgMBAAECggEAOMDWdaW0IbSQv54oz2WYLfKTUCHMBp1Oz1kooEaRk/YD\nswcs9nxG6pt88r5XFG6MyM0VmTX2sqaNE4IKlZ+tkvCH2657Ur4L8x6+Xr1kaHwH\nVMCoEeRPm4IPJ+lNC98aj/nc5WEvgOViRatuGitkpS2xhqvtpQINhUuKs0246XYb\nhEhZAtZI/MMVLDFTi7PQlYPJTm/fZJwOy9zX/S6Z/ZrBlFV6SbuXNCGxgMuzXyee\ngSF7lhnPFCVy5B2UFaRVUI6ELrxU78ianM0G1cT6kzjXXdF7Hepa8ASY73bmLBTk\nf9iIz15ES337ApCHVpZh/xWF2zvtbRaA0R/9RLyuVwKBgQD/krZvJKR1slnSvQ5C\nXC00mi1H/mt4oXCsQ/NuNvPYIdFJthoC8DkA29wWZXefzT2e/Pxlzx1JqWsQzg4F\ncX0Yq1bEvO7Y1/yOQB6eO5crYFHk5QWvcD2Icn4MYwxRijc/aQl5aIZqKZITB+Tw\nXedEIvW9oAghHkXVGVbc58GxWwKBgQDfviOc20c7QpMhOoM4pcXNShKHnLDE49FB\nIdOliwZYw/deQzxpUWLlU99lNfdKCaic5C3Qv+f+gyPb6DGtK1IY/F9yZghDbO35\nqk0KXhmAFWKs4thzOlYJ9ES4Vfpbmn4+JG4eGANHekwE/brjhg2RgmVCnCzvl0jH\ntBoIKwYJwwKBgQCwqcO99EBSs2RvzgurR3hgIism1vGHQ2FVUutUxlusjUPUhjJY\n0aE1vMTYHm+gYQk1e38lCRQftSKzTRxYGuj0QowKFuersTF9S0le66ZFb6FsbfuO\nGDIQvcPv4A/F1Zr3FC5eZCh1/iJhUVWp6d9RNDFWUOcNrZVsBsYKkZFMfQKBgGrE\nB6hs9qOvlBfSHRXl/OqGQytVOQDrGUp0QtOG8MNg1+SyPtyeyotWJ47bXqKE02Hy\nfG5VdPX9TBo+xZ21w1pK65ziVWUfULvHaTXeS1rUWZ7YLKNnnfDoD/bKiEo4Aa/T\noHxZxw7PrADhttGlgUoDKCDN959o2ID7T0TAiwQTAoGBALnVMgVn6JFMzDWaAkgi\nlj+Ow9VK1OeepHeWrBAqOFq1ZyTK4yrgvRQaVLzyJOsXVc7tw+ABAr8Pj/x71Wuf\nrGrgZYb4MgbvwdfZ8soEMli9FrV68cScdh0lm04HEtnxNLAq49X8rcwa23pcRwR7\ndfhRxUlAWwb0Tigjj4Y++rmr\n-----END PRIVATE KEY-----\n',
  });

  await spreadsheet.loadInfo();

  console.log(spreadsheet.title);

  // Pull gas prices every 5 seconds
  gasPriceWatcher.updateEvery(5000);

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

    logPaths(paths, spreadsheet);
  });
};

init();
