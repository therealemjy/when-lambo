import dotenv from 'dotenv';

import { Environment } from '@localTypes';
import env from '@utils/env';

dotenv.config();

export interface EnvConfig {
  environment: Environment;
  isDev: boolean;
  isProd: boolean;
  gasLimitMultiplicator: number;
}

const config: EnvConfig = {
  environment: (process.env.NODE_ENV as Environment) || 'development',
  isProd: (process.env.NODE_ENV as Environment) === 'production',
  isDev: (process.env.NODE_ENV as Environment) === 'development',
  gasLimitMultiplicator: +env('GAS_LIMIT_MULTIPLICATOR'),
};

export default config;
