import BigNumber from 'bignumber.js';
import TypedEmitter from 'typed-emitter';

import logger from '@logger';
import formatStrategies from '@utils/formatStrategies';

import { EnvConfig } from '@bot/config';
import { defaultState, Services } from '@bot/src/bootstrap';
import eventEmitter from '@bot/src/bootstrap/eventEmitter';
import exchanges from '@bot/src/exchanges';

const config: EnvConfig = {
  environment: 'production',
  isDev: true,
  isProd: false,
  serverId: 'test',
  aws: {
    mainnetWssRpcUrl: '',
    accessKeyIdEthNode: '',
    secretAccessKeyEthNode: '',
  },
  slippageAllowancePercent: 0.5,
  gasLimitMultiplicator: 1.2,
  gasPriceMultiplicator: 1.1,
  gasCostMaximumThresholdWei: new BigNumber('43000000000000000'),
  gasEstimates: JSON.parse(
    '{"0":{"0x6B175474E89094C44Da98b954EedeAC495271d0F":"109592"},"1":{"0x6B175474E89094C44Da98b954EedeAC495271d0F":"110529"},"2":{"0x6B175474E89094C44Da98b954EedeAC495271d0F":"117014"}}'
  ),
  strategies: formatStrategies(
    JSON.parse(
      '[{"TRADED_TOKEN_ADDRESS":"0x6B175474E89094C44Da98b954EedeAC495271d0F","TRADED_TOKEN_SYMBOL":"DAI","TRADED_TOKEN_DECIMALS":"18","STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT":"50000000000000000000","STRATEGY_BORROWED_INCREMENT_PERCENT":"10"}]'
    ),
    5
  ),
  googleSpreadSheet: {
    id: '',
    clientEmail: '',
    privateKeyBase64: '',
  },
  slackChannelsWebhooks: {
    deals: '',
    errors: '',
  },
  testOwnerAccountPrivateKey: '',
};

export const getTestServices = (): Services => {
  const services: Services = {
    state: defaultState,
    config,
    logger,
    exchanges,
    eventEmitter,
    strategies: config.strategies,
  };

  return services;
};
