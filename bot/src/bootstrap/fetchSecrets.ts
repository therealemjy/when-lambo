import AWS from 'aws-sdk';

import config, { env } from '@src/config';

import logger from './logger';

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
      ownerAccountPrivateKey: env('TEST_OWNER_ACCOUNT_MAINNET_PRIVATE_KEY'),
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

    // Decrypts secret using the associated KMS CMK.
    // Depending on whether the secret is a string or binary, one of these fields will be populated.
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
