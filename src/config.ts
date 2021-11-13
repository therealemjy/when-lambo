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
  toToken: {
    address: string;
    symbol: string;
    decimals: number;
    // TODO: move outside of toToken (confusing)
    weiAmounts: BigNumber[];
  };
  googleSpreadSheet: {
    worksheetId: string;
    clientEmail: string;
    privateKeyBase64: string;
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
  toToken: {
    address: process.env.TRADED_TOKEN_ADDRESS!,
    symbol: process.env.TRADED_TOKEN_SYMBOL!,
    decimals: +process.env.TRADED_TOKEN_DECIMALS!,
    weiAmounts: process.env.TRADED_TOKEN_WEI_AMOUNTS!.split(',').map((amount) => new BigNumber(amount)),
  },
  googleSpreadSheet: {
    worksheetId: process.env.GOOGLE_SPREADSHEET_WORKSHEET_ID!,
    clientEmail: process.env.GOOGLE_SPREADSHEET_CLIENT_EMAIL!,
    privateKeyBase64: process.env.GOOGLE_SPREADSHEET_PRIVATE_KEY_BASE_64!,
  },
};

export default config;
