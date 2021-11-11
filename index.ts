import AWSWebsocketProvider from '@aws/web3-ws-provider';
import { Multicall, ContractCallResults, ContractCallContext } from '@maxime.julian/ethereum-multicall';
import 'console.table';
import { ethers } from 'ethers';
import { GoogleSpreadsheet } from 'google-spreadsheet';

import { Token } from '@src/types';

import './@moduleAliases';
import config from './src/config';
import BalancerV2Exchange from './src/exchanges/balancerV2';
import CryptoComExchange from './src/exchanges/cryptoCom';
import KyberExchange from './src/exchanges/kyber';
import SushiswapExchange from './src/exchanges/sushiswap';
import UniswapV2Exchange from './src/exchanges/uniswapV2';
import gasPriceWatcher from './src/gasPriceWatcher';
import logPaths from './src/logPaths';
import monitorPrices from './src/monitorPrices';
import { WETH } from './src/tokens';

const tradedToken: Token = {
  symbol: config.tradedToken.symbol,
  address: config.tradedToken.address,
  decimals: config.tradedToken.decimals,
};

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

    const contractCallContext: ContractCallContext<{ extraContext: string; foo4: boolean }>[] = [
      {
        reference: 'testContract',
        contractAddress: '0x6795b15f3b16Cf8fB3E56499bbC07F6261e9b0C3',
        abi: [
          {
            name: 'foo',
            type: 'function',
            inputs: [{ name: 'example', type: 'uint256' }],
            outputs: [{ name: 'amounts', type: 'uint256' }],
          },
        ],
        calls: [{ reference: 'fooCall', methodName: 'foo', methodParameters: [42] }],
        context: {
          extraContext: 'extraContext',
          foo4: true,
        },
      },
      {
        reference: 'testContract2',
        contractAddress: '0x66BF8e2E890eA0392e158e77C6381b34E0771318',
        abi: [
          {
            name: 'fooTwo',
            type: 'function',
            inputs: [{ name: 'example', type: 'uint256' }],
            outputs: [
              { name: 'amounts', type: 'uint256' },
              { name: 'path', type: 'address[]' },
            ],
          },
        ],
        calls: [{ reference: 'fooTwoCall', methodName: 'fooTwo', methodParameters: [42] }],
      },
    ];

    const fn = async () => {
      const results: ContractCallResults = await multicall.call(contractCallContext);
      console.log(results);
    };

    fn();

    return;

    // Instantiate exchange services
    const uniswapV2ExchangeService = new UniswapV2Exchange(provider);
    const sushiswapExchangeService = new SushiswapExchange(provider);
    const kyberExchangeService = new KyberExchange(provider);
    const cryptoComExchangeService = new CryptoComExchange(provider);
    const balancerV2ExchangeService = new BalancerV2Exchange(provider);

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

      const paths = await monitorPrices({
        refTokenDecimalAmounts: config.tradedToken.weiAmounts,
        refToken: WETH,
        tradedToken,
        exchanges: [
          uniswapV2ExchangeService,
          sushiswapExchangeService,
          kyberExchangeService,
          cryptoComExchangeService,
          balancerV2ExchangeService,
        ],
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
