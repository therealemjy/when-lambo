import http from 'http';

import { registerEventListeners } from './eventEmitter/registerEvents';
import gasPriceWatcher from './gasPriceWatcher';
import logger from './logger';

// We set global variable to their default value
const setupGlobalStateVariables = () => {
  // True while the bot compares the prices
  global.isMonitoring = false;
  // Set to the last date the bot checked prices
  global.lastMonitoringDateTime = null;
  global.botExecutionMonitoringTick = 0;
  global.perfMonitoringRecords = [];
};

const server = http.createServer(function (req, res) {
  // GET /health
  if (req.url === '/health' && req.method === 'GET') {
    if (!global.lastMonitoringDateTime) {
      res.writeHead(500);
      res.end('Monitoring not started yet');
      return;
    }

    const currentDateTime = new Date().getTime();
    const secondsElapsedSinceLastMonitoring = (currentDateTime - global.lastMonitoringDateTime) / 1000;

    if (secondsElapsedSinceLastMonitoring >= 60) {
      res.writeHead(500);
      res.end(`Last monitoring was more than 60 seconds ago (${secondsElapsedSinceLastMonitoring}s)`);
      return;
    }

    res.writeHead(200);
    res.end(`Last monitoring was ${secondsElapsedSinceLastMonitoring} seconds ago`);
  }

  if (req.url === '/perf' && req.method === 'GET') {
    if (!global.perfMonitoringRecords) {
      res.writeHead(500);
      res.end('Monitoring not started yet');
      return;
    }

    const sum = global.perfMonitoringRecords.reduce((a, b) => (a += b));
    const len = global.perfMonitoringRecords.length;

    res.writeHead(200);
    res.end(`Average monitoring speed: ${sum / len}ms`);
  }
});

export const bootstrap = async () => {
  server.listen(3000, async () => {
    logger.log('Server started running on port 3000');

    // Register event listeners
    await registerEventListeners();

    // Pull gas prices every 5 seconds
    gasPriceWatcher.start(5000);

    setupGlobalStateVariables();
  });
};
