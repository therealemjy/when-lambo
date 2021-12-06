import BigNumber from 'bignumber.js';

import logger from '@logger';
import formatStrategies from '@utils/formatStrategies';

import { EnvConfig } from '@bot/config';
import { defaultState, Services } from '@bot/src/bootstrap';
import eventEmitter from '@bot/src/eventEmitter';
import exchanges from '@bot/src/exchanges';

const config: EnvConfig = {
  environment: 'production',
  isDev: true,
  isProd: false,
  serverId: 'test',
  slippageAllowancePercent: 0.5,
  gasLimitMultiplicator: 1.2,
  gasPriceMultiplicator: 1.1,
  gasCostMaximumThresholdWei: new BigNumber('63000000000000000'),
  gasEstimates: {
    // Uniswap V2
    '0': { '0x0f5d2fb29fb7d3cfee444a200298f468908cc942': '109592' },
    // Sushiswap
    '1': { '0x0f5d2fb29fb7d3cfee444a200298f468908cc942': '110529' },
    // CryptoCom
    '2': { '0x0f5d2fb29fb7d3cfee444a200298f468908cc942': '117014' },
  },
  strategies: formatStrategies(
    [
      {
        TRADED_TOKEN_ADDRESS: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
        TRADED_TOKEN_SYMBOL: 'MANA',
        TRADED_TOKEN_DECIMALS: '18',
        STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT: '4050000000000000000',
        STRATEGY_BORROWED_INCREMENT_PERCENT: '10',
      },
    ],
    11
  ),
  googleSpreadSheet: {
    id: 'fake-id',
    clientEmail: 'fake-client-email',
    privateKeyBase64: 'fake-private-key-base-64',
  },
  slackChannelsWebhooks: {
    deals: 'fake-channel-webhook',
  },
  testOwnerAccountPrivateKey: 'fake-private-key',
  sentryDNS: 'fake-sentry-dns',
  aws: {
    mainnetWssRpcUrl: 'fake-mainnet-wss-rpc-url',
    accessKeyIdEthNode: 'fake-access-key-id-eth-node',
    secretAccessKeyEthNode: 'fake-secret-access-key-eth-node',
  },
};

const mockServices = (): Services => {
  const services: Services = {
    state: {
      ...defaultState,
      currentGasPrices: {
        rapid: new BigNumber('100000000000'), // 100 Gwei
        fast: new BigNumber('80000000000'), // 80 Gwei
        standard: new BigNumber('60000000000'), // 60 Gwei
        slow: new BigNumber('40000000000'), // 40 Gwei
      },
    },
    config,
    logger,
    exchanges,
    eventEmitter,
    strategies: config.strategies,
  };

  return services;
};

export default mockServices;
