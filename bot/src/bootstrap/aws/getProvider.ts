import AWSWebsocketProvider from '@aws/web3-ws-provider';
import { ethers } from 'ethers';

import config from '@bot/config';

const getAwsWSProvider = () => {
  const provider = new ethers.providers.Web3Provider(
    new AWSWebsocketProvider(config.aws.mainnetWssRpcUrl, {
      clientConfig: {
        maxReceivedFrameSize: 100000000, // bytes - default: 1MiB
        maxReceivedMessageSize: 100000000, // bytes - default: 8MiB
        keepalive: true,
        keepaliveInterval: 60000, // ms
        credentials: {
          accessKeyId: config.aws.accessKeyIdEthNode,
          secretAccessKey: config.aws.secretAccessKeyEthNode,
        },
      },
      // Enable auto reconnection
      reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 5,
        onTimeout: false,
      },
    })
  );

  return provider;
};

export default getAwsWSProvider;
