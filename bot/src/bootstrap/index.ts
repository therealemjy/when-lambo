import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import http from 'http';
import TypedEmitter from 'typed-emitter';

import { Strategy } from '@localTypes';
import logger from '@logger';

import config, { EnvConfig } from '@bot/config';
import exchanges from '@bot/src/exchanges';
import UniswapLikeExchange from '@bot/src/exchanges/UniswapLikeExchange';

import eventEmitter, { MessageEvents } from './eventEmitter';
import { registerEventListeners } from './eventEmitter/registerEvents';
import fetchSecrets from './fetchSecrets';
import gasPriceWatcher from './gasPriceWatcher';
import getAwsWSProvider from './getAwsWSProvider';

export type State = {
  monitoringActivated: boolean;
  lastMonitoringDateTime: number | null;
  secrets:
    | {
        ownerAccountPrivateKey: string;
      }
    | undefined;
  botExecutionMonitoringTick: number;

  perfMonitoringRecords: number[];

  currentGasPrices: {
    rapid: BigNumber;
    fast: BigNumber;
    standard: BigNumber;
    slow: BigNumber;
  };
};

export const defaultState: State = {
  // safe guard if we found a trade
  monitoringActivated: true,

  // Set to the last date the bot checked prices
  lastMonitoringDateTime: null,
  botExecutionMonitoringTick: 0,
  perfMonitoringRecords: [],
  currentGasPrices: {
    rapid: new BigNumber(0),
    fast: new BigNumber(0),
    standard: new BigNumber(0),
    slow: new BigNumber(0),
  },
  secrets: undefined,
};

export type Services = {
  state: State;
  config: EnvConfig;
  logger: typeof logger;
  exchanges: UniswapLikeExchange[];
  eventEmitter: TypedEmitter<MessageEvents>;
  strategies: Strategy[];
};

const services: Services = {
  state: defaultState,
  config,
  logger,
  exchanges,
  eventEmitter,
  strategies: config.strategies,
};

const server = http.createServer(function (req, res) {
  // GET /health
  if (req.url === '/health' && req.method === 'GET') {
    if (!services.state.lastMonitoringDateTime) {
      res.writeHead(500);
      res.end('Monitoring not started yet');
      return;
    }

    const currentDateTime = new Date().getTime();
    const secondsElapsedSinceLastMonitoring = (currentDateTime - services.state.lastMonitoringDateTime) / 1000;

    if (secondsElapsedSinceLastMonitoring >= 60) {
      res.writeHead(500);
      res.end(`Last monitoring was more than 60 seconds ago (${secondsElapsedSinceLastMonitoring}s)`);
      return;
    }

    res.writeHead(200);
    res.end(`Last monitoring was ${secondsElapsedSinceLastMonitoring} seconds ago`);
  }

  if (req.url === '/perf' && req.method === 'GET') {
    if (!services.state.perfMonitoringRecords) {
      res.writeHead(500);
      res.end('Monitoring not started yet');
      return;
    }

    const sum = services.state.perfMonitoringRecords.reduce((a, b) => (a += b));
    const len = services.state.perfMonitoringRecords.length;

    res.writeHead(200);
    res.end(`Average monitoring speed: ${sum / len}ms`);
  }
});

export const bootstrap = async (): Promise<{ services: Services; provider: ethers.providers.Web3Provider }> =>
  new Promise((resolve) => {
    server.listen(3000, async () => {
      logger.log('Server started running on port 3000');

      // Get secrets
      const secrets = await fetchSecrets();

      // Add secrets to state
      services.state.secrets = secrets;

      const provider = getAwsWSProvider();
      const ownerAccount = new ethers.Wallet(secrets.ownerAccountPrivateKey, provider);

      // Register event listeners
      await registerEventListeners({
        signer: ownerAccount,
        gasLimitMultiplicator: services.config.gasLimitMultiplicator,
      });

      // Pull gas prices every 5 seconds
      await gasPriceWatcher.start(services, (gasPrices) => (services.state.currentGasPrices = gasPrices), 5000);

      // We will use this instance of state throughout the bot with dependencies injection, making testing way easier
      resolve({ services, provider });
    });
  });
