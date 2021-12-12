import { Multicall } from '@maxime.julian/ethereum-multicall';
import { ethers, Signer } from 'ethers';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import http from 'http';
import TypedEmitter from 'typed-emitter';

import { GasFees } from '@communicator/types';
import { Strategy } from '@localTypes';
import logger from '@logger';

import { Transactor as ITransactorContract } from '@chainHandler/typechain';

import config, { EnvConfig } from '@bot/config';
import eventEmitter, { MessageEvents } from '@bot/src/eventEmitter';
import exchanges from '@bot/src/exchanges';
import UniswapLikeExchange from '@bot/src/exchanges/UniswapLikeExchange';

import fetchSecrets from './fetchSecrets';
import getAwsWSProvider from './getAwsWSProvider';
import getSpreadsheet from './getSpreadsheet';
import getTransactorContract from './getTransactorContract';
import Messenger from './messenger';

export type State = {
  isMonitoringActivated: boolean;
  lastMonitoringDateTime?: number;
  lastGasPriceUpdateDateTime?: number;
  botExecutionMonitoringTick: number;
  perfMonitoringRecords: number[];
  gasFees?: GasFees;
};

export const defaultState: State = {
  // safe guard if we found a trade
  isMonitoringActivated: true,
  // Set to the last date the bot checked prices
  botExecutionMonitoringTick: 0,
  perfMonitoringRecords: [],
};

export type Services = {
  state: State;
  config: EnvConfig;
  logger: typeof logger;
  exchanges: UniswapLikeExchange[];
  eventEmitter: TypedEmitter<MessageEvents>;
  strategies: Strategy[];
  messenger?: Messenger;
};

const services: Services = {
  state: defaultState,
  config,
  logger,
  exchanges,
  eventEmitter,
  strategies: config.strategies,
  messenger: new Messenger({
    communicatorWssUrl: config.communicationWssUrl,
    onGasFeesUpdate: (gasFees) => {
      services.state.gasFees = gasFees;
      services.state.lastGasPriceUpdateDateTime = new Date().getTime();
    },
    onStopMonitoringSignalMessage: () => {
      services.state.isMonitoringActivated = false;
    },
  }),
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
      const multicall = new Multicall({ ethersProvider: provider, tryAggregate: true });

      // Only sign the Transactor contract with the actual owner in prod
      let ownerAccount: Signer | undefined = undefined;

      if (services.config.isProd) {
        const secrets = await fetchSecrets({
          region: services.config.aws.region,
          secretName: services.config.aws.secretName,
        });
        ownerAccount = new ethers.Wallet(secrets.ownerAccountPrivateKey, provider);
      }

      const TransactorContract = getTransactorContract(services.config.isProd, ownerAccount);

      // Get Google Spreadsheet
      const spreadsheet = await getSpreadsheet();

      // We will use this instance of state throughout the bot with dependencies
      // injection, making testing way easier
      resolve({ services, provider, spreadsheet, multicall, TransactorContract });
    });
  });
