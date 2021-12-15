import AWS from 'aws-sdk';

import logger from '@logger';

export type WLSecrets = {
  ownerAccountPrivateKey: string;
};

interface IFetchSecretsInput {
  region: string;
  secretName: string;
}

const fetchSecrets = async ({ region, secretName }: IFetchSecretsInput): Promise<WLSecrets> => {
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
    logger.error(err);
    throw err;
  }
};

export default fetchSecrets;
