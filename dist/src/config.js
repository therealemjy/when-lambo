"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const env = (name) => {
    const value = process.env[`${name}`];
    if (!value) {
        throw new Error(`Missing: process.env['${name}'].`);
    }
    return value;
};
const config = {
    aws: {
        wsRpcUrl: env('AWS_WS_RPC_URL'),
        accessKeyId: env('AWS_ACCESS_KEY_ID'),
        secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
    },
    isProd: process.env.NODE_ENV === 'production',
    isDev: process.env.NODE_ENV === 'development',
    slippageAllowancePercent: +env('SLIPPAGE_ALLOWANCE_PERCENT'),
    gasLimitMultiplicator: +env('GAS_LIMIT_MULTIPLICATOR'),
    gasPriceMultiplicator: +env('GAS_PRICE_MULTIPLICATOR'),
    toToken: {
        address: env('TRADED_TOKEN_ADDRESS'),
        symbol: env('TRADED_TOKEN_SYMBOL'),
        decimals: +env('TRADED_TOKEN_DECIMALS'),
        weiAmounts: env('TRADED_TOKEN_WEI_AMOUNTS')
            .split(',')
            .map((amount) => new bignumber_js_1.default(amount)),
    },
    googleSpreadSheet: {
        worksheetId: env('GOOGLE_SPREADSHEET_WORKSHEET_ID'),
        clientEmail: env('GOOGLE_SPREADSHEET_CLIENT_EMAIL'),
        privateKeyBase64: env('GOOGLE_SPREADSHEET_PRIVATE_KEY_BASE_64'),
    },
    slackChannelsWebhooks: {
        deals: env('SLACK_HOOK_URL_DEALS'),
        errors: env('SLACK_HOOK_URL_ERRORS'),
    },
};
exports.default = config;
//# sourceMappingURL=config.js.map