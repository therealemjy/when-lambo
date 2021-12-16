import WebSocket from 'ws';

import { GasFees } from '@localTypes';
import logger from '@logger';

import { Message, StopMonitoringSignalMessage } from '@communicator/types';

class Messenger {
  wsClient: WebSocket | undefined;
  onStopMonitoringSignalMessage: () => void;
  onGasFeesUpdate: (gasFees: GasFees) => void;

  constructor({
    communicatorWssUrl,
    onStopMonitoringSignalMessage,
    onGasFeesUpdate,
  }: {
    communicatorWssUrl: string;
    onStopMonitoringSignalMessage: () => void;
    onGasFeesUpdate: (gasFees: GasFees) => void;
  }) {
    // Set callbacks
    this.onStopMonitoringSignalMessage = onStopMonitoringSignalMessage;
    this.onGasFeesUpdate = onGasFeesUpdate;

    // Setup connection
    // This method calls itself after 5s if the connection drops
    this.connect(communicatorWssUrl);
  }

  private tryReconnect(communicatorWssUrl: string) {
    // Remove listeners
    this.wsClient?.removeAllListeners();

    logger.error('Messenger connection closed, trying to reconnect in 5s');

    setTimeout(() => {
      this.connect(communicatorWssUrl);
    }, 5000);
  }

  private connect(communicatorWssUrl: string) {
    this.wsClient = new WebSocket(communicatorWssUrl);

    // Handle and log errors
    this.wsClient.on('error', (data) => {
      logger.error(data);

      // Close faulty connection
      this.wsClient?.close();
    });

    // Reacts on connection drops
    this.wsClient.on('close', () => {
      // Try reconnection
      this.tryReconnect(communicatorWssUrl);
    });

    // Handle incoming messages
    this.wsClient.on('message', (data) => {
      const message = JSON.parse(data.toString()) as Message;

      switch (message.type) {
        case 'gasFeesUpdate':
          this.onGasFeesUpdate(message.data);
          break;

        case 'stopMonitoringSignal':
          this.onStopMonitoringSignalMessage();
          break;
      }
    });
  }

  sendStopMonitoringSignal() {
    const message: StopMonitoringSignalMessage = {
      type: 'stopMonitoringSignal',
    };

    this.wsClient?.send(JSON.stringify(message));
  }
}

export default Messenger;
