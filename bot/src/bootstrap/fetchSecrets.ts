import AWS from 'aws-sdk';

import config from '@src/config';

import logger from './logger';

type WLSecrets = {
  mnemonic: string;
};

const fetchSecrets = async (): Promise<WLSecrets> => {
  if (config.isDev && config.testMnemonic) {
    return {
      mnemonic: config.testMnemonic,
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
    let secret: any;
    const data = await client.getSecretValue({ SecretId: secretName }).promise();

    // Decrypts secret using the associated KMS CMK.
    // Depending on whether the secret is a string or binary, one of these fields will be populated.
    if (data.SecretString) {
      secret = JSON.parse(data.SecretString);
    }

    return {
      mnemonic: secret.mnemonic,
    };
  } catch (err: any) {
    logger.error('Error while decoding secrets', err);
    throw err;
  }
};

export default fetchSecrets;
