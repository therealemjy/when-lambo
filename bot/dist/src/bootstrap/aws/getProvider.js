"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_ws_provider_1 = __importDefault(require("@aws/web3-ws-provider"));
const ethers_1 = require("ethers");
const config_1 = __importDefault(require("@src/bootstrap/config"));
const getAwsWSProvider = () => {
    const provider = new ethers_1.ethers.providers.Web3Provider(new web3_ws_provider_1.default(config_1.default.aws.mainnetWssRpcUrl, {
        clientConfig: {
            maxReceivedFrameSize: 100000000,
            maxReceivedMessageSize: 100000000,
            keepalive: true,
            keepaliveInterval: 60000,
            credentials: {
                accessKeyId: config_1.default.aws.accessKeyIdEthNode,
                secretAccessKey: config_1.default.aws.secretAccessKeyEthNode,
            },
            // Enable auto reconnection
            reconnect: {
                auto: true,
                delay: 5000,
                maxAttempts: 5,
                onTimeout: false,
            },
        },
    }));
    return provider;
};
exports.default = getAwsWSProvider;
//# sourceMappingURL=getProvider.js.map