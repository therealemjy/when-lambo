import AWS from 'aws-sdk';

import config from '@src/bootstrap/config';

import logger from './logger';

type WLSecrets = {
  mnemonic: string;
};

const fetchSecrets = async (): Promise<WLSecrets> => {
  if (config.isDev) {
    return {
      mnemonic: 'add test mnemonic',
    };
  }

  // Load the AWS SDK
  const region = 'us-east-1';
  const secretName = 'arn:aws:secretsmanager:us-east-1:725566919168:secret:prod/secret-O2a6FL';

  // Create a Secrets Manager client
  const client = new AWS.SecretsManager({
    region: region,
    credentials: new AWS.EC2MetadataCredentials(), // Get credentials from IAM role
  });

  try {
    let secret: any;
    const data = await client.getSecretValue({ SecretId: secretName }).promise();

    // Decrypts secret using the associated KMS CMK.
    // Depending on whether the secret is a string or binary, one of these fields will be populated.
    if ('SecretString' in data) {
      secret = data.SecretString;
    }

    logger.log('Secrets successfully retrieved from secret manager.');

    return {
      mnemonic: secret.nmemonic,
    };
  } catch (err: any) {
    logger.error('Error while decoding secrets', err);
    throw err;
  }
};

export default fetchSecrets;
