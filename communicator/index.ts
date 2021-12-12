import WebSocket, { WebSocketServer } from 'ws';

import logger from '@logger';

import GasFeesWatcher, { GasFees } from './GasFeesWatcher';
import config from './config';
import { PORT } from './constant';
import { Message, GasFeesUpdateMessage } from './types';

let gasFees: GasFees;

const gasFeesWatcher = new GasFeesWatcher(config.blocknativeApiKey, config.maxPriorityFeePerGasMultiplicator);
const wss = new WebSocketServer({ port: PORT });

wss.on('listening', () => {
  // Pull and update gas prices every 5.5 seconds (blocknative rate limit
  // being one request every 5 seconds)
  gasFeesWatcher.start((updatedGasFees) => {
    // Update state
    gasFees = updatedGasFees;

    // Broadcast updated gas fees to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        const message: GasFeesUpdateMessage = {
          type: 'gasFeesUpdate',
          data: updatedGasFees,
        };

        client.send(JSON.stringify(message));
      }
    });
  }, 5500);
});

// Handle new client connections
wss.on('connection', function connection(connectedClient) {
  logger.log('New client connected', connectedClient.url);

  // Send current gas fees to client, if they have been fetched at least once
  if (gasFees) {
    const initialMessage: GasFeesUpdateMessage = {
      type: 'gasFeesUpdate',
      data: gasFees,
    };

    connectedClient.send(JSON.stringify(initialMessage));
  }

  // Initialize message handler
  connectedClient.on('message', (data) => {
    const message = JSON.parse(data.toString()) as Message;

    if (message.type === 'stopMonitoringSignal') {
      // Broadcast event to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    }
  });
});
