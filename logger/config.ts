import dotenv from 'dotenv';

import { Environment } from '@localTypes';
import env from '@utils/env';

dotenv.config();

export interface EnvConfig {
  environment: Environment;
  isDev: boolean;
  isProd: boolean;
  slackChannelsWebhooks: {
    deals: string;
  };
}

const config: EnvConfig = {
  environment: (process.env.NODE_ENV as Environment) || 'development',
  isProd: (process.env.NODE_ENV as Environment) === 'production',
  isDev: (process.env.NODE_ENV as Environment) === 'development',
  slackChannelsWebhooks: {
    deals: env('SLACK_HOOK_URL_DEALS'),
  },
};

export default config;
