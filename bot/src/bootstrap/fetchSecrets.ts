import AWS from 'aws-sdk';

import logger from '@logger';

import config from '@chainHandler/config';

export type WLSecrets = {
  ownerAccountPrivateKey: string;
};

const fetchSecrets = async (): Promise<WLSecrets> => {
  if (config.isDev) {
    return {
      // WARNING: this private key corresponds to a REAL account on the mainnet,
      // but this private key is well known since it's one of the accounts
      // Hardhat uses for tests. DO NOT ever send any funds to this address and
      // do not use it for anything else than obtaining transaction estimates.
      ownerAccountPrivateKey: config.testAccounts.owner.privateKey,
    };
  }

  // Load the AWS SDK
  const region = 'us-east-1';
  const secretName = 'arn:aws:secretsmanager:us-east-1:725566919168:secret:prod/secret-O2a6FL';

  // Create a Secrets Manager client
  const client = new AWS.SecretsManager({
    region: region,
    credentials: new AWS.EC2MetadataCredentials(),
  });

  try {
    const data = await client.getSecretValue({ SecretId: secretName }).promise();
    const secret = data.SecretString ? (JSON.parse(data.SecretString) as WLSecrets) : undefined;

    if (!secret) {
      throw new Error('Could not fetch secrets');
    }

    return {
      ownerAccountPrivateKey: secret.ownerAccountPrivateKey,
    };
  } catch (err: unknown) {
    logger.error('Error while decoding secrets', err);
    throw err;
  }
};

export default fetchSecrets;
