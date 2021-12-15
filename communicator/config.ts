import dotenv from 'dotenv';

import env from '@utils/env';

dotenv.config();

export interface EnvConfig {
  blocknativeApiKey: string;
  maxPriorityFeePerGasMultiplicator: number;
}

const config: EnvConfig = {
  blocknativeApiKey: env('BLOCKNATIVE_API_KEY_COMMUNICATOR'),
  maxPriorityFeePerGasMultiplicator: +env('MAX_PRIORITY_FEE_PER_GAS_MULTIPLICATOR'),
};

export default config;
