import BigNumber from 'bignumber.js';
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
  tradedToken: {
    address: string;
    symbol: string;
    decimals: number;
    weiAmounts: BigNumber[];
  };
}

const config: EnvConfig = {
  aws: {
    wsRpcUrl: process.env.AWS_WS_RPC_URL!,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  slippageAllowancePercent: +process.env.SLIPPAGE_ALLOWANCE_PERCENT!,
  tradedToken: {
    address: process.env.TRADED_TOKEN_ADDRESS!,
    symbol: process.env.TRADED_TOKEN_SYMBOL!,
    decimals: +process.env.TRADED_TOKEN_DECIMALS!,
    weiAmounts: process.env.TRADED_TOKEN_WEI_AMOUNTS!.split(',').map((amount) => new BigNumber(amount)),
  },
};

export default config;
