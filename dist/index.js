"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_ws_provider_1 = __importDefault(require("@aws/web3-ws-provider"));
const ethereum_multicall_1 = require("@maxime.julian/ethereum-multicall");
require("console.table");
const ethers_1 = require("ethers");
require("./@moduleAliases");
const blockHandler_1 = __importDefault(require("./src/blockHandler"));
const config_1 = __importDefault(require("./src/config"));
const eventEmitter_1 = __importDefault(require("./src/eventEmitter"));
const cryptoCom_1 = __importDefault(require("./src/exchanges/cryptoCom"));
const kyber_1 = __importDefault(require("./src/exchanges/kyber"));
const sushiswap_1 = __importDefault(require("./src/exchanges/sushiswap"));
const uniswapV2_1 = __importDefault(require("./src/exchanges/uniswapV2"));
const gasPriceWatcher_1 = __importDefault(require("./src/gasPriceWatcher"));
const logPaths_1 = __importDefault(require("./src/logPaths"));
const getWorksheet_1 = __importDefault(require("./src/utils/getWorksheet"));
const sendSlackMessage_1 = __importStar(require("./src/utils/sendSlackMessage"));
const THIRTY_MINUTES_IN_MILLISECONDS = 1000 * 60 * 30;
global.isMonitoring = false;
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    const worksheet = yield (0, getWorksheet_1.default)();
    // Pull gas prices every 5 seconds
    gasPriceWatcher_1.default.updateEvery(5000);
    // Handle paths found
    eventEmitter_1.default.on('paths', (paths) => (0, logPaths_1.default)(paths, worksheet));
    // Handle errors
    eventEmitter_1.default.on('error', (error) => {
        // Format the error to a human-readable format and send it to slack
        const formattedError = (0, sendSlackMessage_1.formatErrorToSlackBlock)(error, config_1.default.toToken.symbol);
        (0, sendSlackMessage_1.default)(formattedError, 'errors');
    });
    const start = () => {
        const provider = new ethers_1.ethers.providers.Web3Provider(new web3_ws_provider_1.default(config_1.default.aws.wsRpcUrl, {
            clientConfig: {
                credentials: {
                    accessKeyId: config_1.default.aws.accessKeyId,
                    secretAccessKey: config_1.default.aws.secretAccessKey,
                },
            },
        }));
        const multicall = new ethereum_multicall_1.Multicall({ ethersProvider: provider, tryAggregate: true });
        // Instantiate exchange services
        const uniswapV2ExchangeService = new uniswapV2_1.default();
        const sushiswapExchangeService = new sushiswap_1.default();
        const kyberExchangeService = new kyber_1.default();
        const cryptoComExchangeService = new cryptoCom_1.default();
        provider.addListener('block', (0, blockHandler_1.default)(multicall, [
            uniswapV2ExchangeService,
            sushiswapExchangeService,
            kyberExchangeService,
            cryptoComExchangeService,
        ]));
        console.log('Price monitoring bot started.');
        // Regularly restart the bot so the websocket connection doesn't idle
        setTimeout(() => {
            console.log('Restarting bot...');
            // Shut down bot
            provider.removeAllListeners();
            start();
        }, THIRTY_MINUTES_IN_MILLISECONDS);
    };
    // Start bot
    start();
});
init();
//# sourceMappingURL=index.js.map