import { Multicall } from '@maxime.julian/ethereum-multicall';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import http from 'http';
import TypedEmitter from 'typed-emitter';

import { Strategy } from '@localTypes';
import logger from '@logger';

import { Transactor as ITransactorContract } from '@chainHandler/typechain';

import config, { EnvConfig } from '@bot/config';
import eventEmitter, { MessageEvents } from '@bot/src/eventEmitter';
import exchanges from '@bot/src/exchanges';
import UniswapLikeExchange from '@bot/src/exchanges/UniswapLikeExchange';

import fetchSecrets from './fetchSecrets';
import gasPriceWatcher from './gasPriceWatcher';
import getAwsWSProvider from './getAwsWSProvider';
import getSpreadsheet from './getSpreadsheet';
import getTransactorContract from './getTransactorContract';

export type State = {
  monitoringActivated: boolean;
  lastMonitoringDateTime: number | null;
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

export const bootstrap = async (): Promise<{
  services: Services;
  provider: ethers.providers.Web3Provider;
  TransactorContract: ITransactorContract;
  spreadsheet: GoogleSpreadsheet;
  multicall: Multicall;
}> =>
  new Promise((resolve) => {
    server.listen(3000, async () => {
      logger.log('Server started running on port 3000');

      // Get provider and other blockchain related elements
      const provider = getAwsWSProvider();
      const secrets = await fetchSecrets();
      const ownerAccount = new ethers.Wallet(secrets.ownerAccountPrivateKey, provider);
      const multicall = new Multicall({ ethersProvider: provider, tryAggregate: true });
      const TransactorContract = getTransactorContract(ownerAccount, services.config.isProd);

      // Get Google Spreadsheet
      const spreadsheet = await getSpreadsheet();

      // Pull and update gas prices every 5 seconds
      await gasPriceWatcher.start(services, (gasPrices) => (services.state.currentGasPrices = gasPrices), 5000);

      // We will use this instance of state throughout the bot with dependencies injection, making testing way easier
      resolve({ services, provider, spreadsheet, multicall, TransactorContract });
    });
  });
