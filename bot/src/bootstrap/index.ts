import BigNumber from 'bignumber.js';
import http from 'http';

import logger from '@logger';

import { registerEventListeners } from './eventEmitter/registerEvents';
import fetchSecrets from './fetchSecrets';
import gasPriceWatcher from './gasPriceWatcher';

export type State = {
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

const state: State = {
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

const server = http.createServer(function (req, res) {
  // GET /health
  if (req.url === '/health' && req.method === 'GET') {
    if (!state.lastMonitoringDateTime) {
      res.writeHead(500);
      res.end('Monitoring not started yet');
      return;
    }

    const currentDateTime = new Date().getTime();
    const secondsElapsedSinceLastMonitoring = (currentDateTime - state.lastMonitoringDateTime) / 1000;

    if (secondsElapsedSinceLastMonitoring >= 60) {
      res.writeHead(500);
      res.end(`Last monitoring was more than 60 seconds ago (${secondsElapsedSinceLastMonitoring}s)`);
      return;
    }

    res.writeHead(200);
    res.end(`Last monitoring was ${secondsElapsedSinceLastMonitoring} seconds ago`);
  }

  if (req.url === '/perf' && req.method === 'GET') {
    if (!state.perfMonitoringRecords) {
      res.writeHead(500);
      res.end('Monitoring not started yet');
      return;
    }

    const sum = state.perfMonitoringRecords.reduce((a, b) => (a += b));
    const len = state.perfMonitoringRecords.length;

    res.writeHead(200);
    res.end(`Average monitoring speed: ${sum / len}ms`);
  }
});

export const bootstrap = async (): Promise<State> =>
  new Promise((resolve) => {
    server.listen(3000, async () => {
      logger.log('Server started running on port 3000');

      // Get secrets
      const secrets = await fetchSecrets();

      // Register secrets in global variable
      state.secrets = secrets;

      // Register event listeners
      await registerEventListeners();

      // Pull gas prices every 5 seconds
      await gasPriceWatcher.start((gasPrices) => (state.currentGasPrices = gasPrices), 5000);

      // We will use this instance of state throughout the bot with dependencies injection, making testing way easier
      resolve(state);
    });
  });
