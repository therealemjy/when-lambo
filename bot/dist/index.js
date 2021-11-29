"use strict";
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
const ethers_1 = require("ethers");
require("./@moduleAliases");
const blockHandler_1 = __importDefault(require("./src/blockHandler"));
const bootstrap_1 = require("./src/bootstrap");
const config_1 = __importDefault(require("./src/bootstrap/config"));
const eventEmitter_1 = __importDefault(require("./src/bootstrap/eventEmitter"));
const logger_1 = __importDefault(require("./src/bootstrap/logger"));
const cryptoCom_1 = __importDefault(require("./src/exchanges/cryptoCom"));
const sushiswap_1 = __importDefault(require("./src/exchanges/sushiswap"));
const uniswapV2_1 = __importDefault(require("./src/exchanges/uniswapV2"));
const handleError_1 = __importDefault(require("./src/utils/handleError"));
const THIRTY_MINUTES_IN_MILLISECONDS = 1000 * 60 * 30;
// Catch unhandled exceptions
process.on('uncaughtException', (error) => {
    (0, handleError_1.default)(error, true);
    process.exit(1);
});
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    const start = () => {
        const provider = new ethers_1.ethers.providers.Web3Provider(new web3_ws_provider_1.default(config_1.default.aws.mainnetWssRpcUrl, {
            clientConfig: {
                maxReceivedFrameSize: 100000000,
                maxReceivedMessageSize: 100000000,
                keepalive: true,
                keepaliveInterval: 60000,
                // Enable auto reconnection
                reconnect: {
                    auto: true,
                    delay: 5000,
                    maxAttempts: 5,
                    onTimeout: false,
                },
            },
        }));
        const multicall = new ethereum_multicall_1.Multicall({ ethersProvider: provider, tryAggregate: true });
        // Instantiate exchange services
        const uniswapV2ExchangeService = new uniswapV2_1.default();
        const sushiswapExchangeService = new sushiswap_1.default();
        const cryptoComExchangeService = new cryptoCom_1.default();
        provider.addListener('block', (0, blockHandler_1.default)({
            multicall,
            exchanges: [uniswapV2ExchangeService, sushiswapExchangeService, cryptoComExchangeService],
        }));
        logger_1.default.log('Price monitoring bot started.');
        // Regularly restart the bot so the websocket connection doesn't idle
        setTimeout(() => {
            logger_1.default.log('Restarting bot...');
            // Shut down bot
            provider.removeAllListeners();
            start();
        }, THIRTY_MINUTES_IN_MILLISECONDS);
    };
    // Start bot
    start();
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, bootstrap_1.bootstrap)();
        yield init();
    }
    catch (err) {
        eventEmitter_1.default.emit('error', err);
        process.exit(1);
    }
}))();
//# sourceMappingURL=index.js.map