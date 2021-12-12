import WebSocket, { WebSocketServer } from 'ws';

import { PORT } from './constant';
import { Message } from './types';

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', function connection(connectedClient) {
  console.log('New client connected');

  // Handler
  connectedClient.on('message', (data) => {
    const message = JSON.parse(data.toString()) as Message;

    // Broadcast event to all connected clients
    if (message.type === 'stopMonitoringSignal') {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    }
  });
});

// Test client
const wsClient = new WebSocket('ws://localhost:6969');

wsClient.on('message', function message(data) {
  console.log('Client 1 received message: %s', data);
});

const wsClient2 = new WebSocket('ws://localhost:6969');

wsClient2.on('open', function open() {
  // Confirms we are connected to communicator
  wsClient.send(JSON.stringify({ type: 'stopMonitoringSignal' }));
});

wsClient2.on('message', function message(data) {
  console.log('Client 2 received message: %s', data);
});
