import { ethers } from 'ethers';

import logger from '@logger';
import formatStrategies from '@utils/formatStrategies';

import { EnvConfig } from '@bot/config';
import eventEmitter from '@bot/src/eventEmitter';
import exchanges from '@bot/src/exchanges';
import { Services } from '@bot/src/types';

const config: EnvConfig = {
  environment: 'test',
  isDev: false,
  isProd: false,
  communicationWssUrl: 'fake-communication-wss-url',
  aws: {
    mainnetWssRpcUrl: 'fake-mainnet-wss-rpc-url',
    accessKeyIdEthNode: 'fake-access-key-id-eth-node',
    secretAccessKeyEthNode: 'fake-secret-access-key-eth-node',
    region: 'fake-region',
    secretName: 'fake-secret-name',
  },
  googleSpreadSheet: {
    id: 'fake-id',
    clientEmail: 'fake-client-email',
    privateKeyBase64: 'fake-private-key-base-64',
  },
  slippageAllowancePercent: 0.5,
  // Note: using anything lower than that will result in transactions failing.
  // I couldn't find the actual reason for it :/
  gasLimitMultiplicator: 1.3,
  gasCostMaximumThresholdWei: ethers.utils.parseUnits('0.063', 'ether'),
  gasEstimates: {
    // Uniswap V2
    '0': {
      '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942': '109592',
      '0x6b175474e89094c44da98b954eedeac495271d0f': '109592',
    },
    // Sushiswap
    '1': {
      '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942': '110529',
      '0x6b175474e89094c44da98b954eedeac495271d0f': '110529',
    },
    // CryptoCom
    '2': {
      '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942': '117014',
      '0x6b175474e89094c44da98b954eedeac495271d0f': '117014',
    },
  },
  strategies: formatStrategies(
    [
      {
        TRADED_TOKEN_ADDRESS: '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942',
        TRADED_TOKEN_SYMBOL: 'MANA',
        TRADED_TOKEN_DECIMALS: '18',
        STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT: '4050000000000000000',
        STRATEGY_BORROWED_INCREMENT_PERCENT: '10',
      },
      {
        TRADED_TOKEN_ADDRESS: '0x6b175474e89094c44da98b954eedeac495271d0f',
        TRADED_TOKEN_SYMBOL: 'DAI',
        TRADED_TOKEN_DECIMALS: '18',
        STRATEGY_BORROWED_MIDDLE_WEI_AMOUNT: '40000000000000000000',
        STRATEGY_BORROWED_INCREMENT_PERCENT: '10',
      },
    ],
    10
  ),
};

export const EXPECTED_REVENUE_WETH = '568270094198623164';

export const mockedServices: Services = {
  state: {
    isMonitoringActivated: true,
    botExecutionMonitoringTick: 0,
    perfMonitoringRecords: [],
    lastGasPriceUpdateDateTime: new Date().getTime(),
    gasFees: {
      maxPriorityFeePerGas: ethers.utils.parseUnits('4', 'gwei').toNumber(),
      maxFeePerGas: ethers.utils.parseUnits('101', 'gwei').toNumber(),
    },
  },
  config,
  logger,
  exchanges,
  eventEmitter,
  strategies: config.strategies,
};
