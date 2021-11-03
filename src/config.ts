import dotenv from 'dotenv';

dotenv.config();

export interface EnvConfig {
  aws: {
    wsRpcUrl: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  environment: 'development' | 'production';
  slippageAllowancePercent: number;
}

const config: EnvConfig = {
  aws: {
    wsRpcUrl: process.env.AWS_WS_RPC_URL!,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  slippageAllowancePercent: +process.env.SLIPPAGE_ALLOWANCE_PERCENT!,
};

export default config;
