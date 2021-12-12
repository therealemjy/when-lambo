import { GasFees, Message } from '@communicator/types';
import WebSocket from 'ws';

import logger from '@logger';

class Messenger {
  wsClient: WebSocket;

  constructor({
    communicatorWssUrl,
    onStopMonitoringMessage,
    onGasFeesUpdate,
  }: {
    communicatorWssUrl: string;
    onStopMonitoringMessage: () => void;
    onGasFeesUpdate: (gasFees: GasFees) => void;
  }) {
    this.wsClient = new WebSocket(communicatorWssUrl);

    this.wsClient.readyState;

    this.wsClient.on('error', (data) => {
      logger.error('Messenger error', data);
    });

    this.wsClient.on('message', (data) => {
      const message = JSON.parse(data.toString()) as Message;

      switch (message.type) {
        case 'gasFeesUpdate':
          onGasFeesUpdate(message.data);
          break;

        case 'stopMonitoringSignal':
          onStopMonitoringMessage();
          break;
      }
    });
  }
}

export default Messenger;
