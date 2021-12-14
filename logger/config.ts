import dotenv from 'dotenv';

import { Environment } from '@localTypes';
import env from '@utils/env';

dotenv.config();

export interface EnvConfig {
  serverId: string;
  environment: Environment;
  isDev: boolean;
  isProd: boolean;
  slackChannelsWebhooks: {
    deals: string;
  };
  sentryDNS: string;
}

const config: EnvConfig = {
  serverId: env('SERVER_ID'),
  environment: (process.env.NODE_ENV as Environment) || 'development',
  isProd: (process.env.NODE_ENV as Environment) === 'production',
  isDev: (process.env.NODE_ENV as Environment) === 'development',
  slackChannelsWebhooks: {
    deals: env('SLACK_HOOK_URL_DEALS'),
  },
  sentryDNS: env('SENTRY_DNS_URL'),
};

export default config;
