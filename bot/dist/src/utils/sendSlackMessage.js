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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatErrorToSlackBlock = void 0;
const https = __importStar(require("https"));
const config_1 = __importDefault(require("@src/bootstrap/config"));
const slackChannels = {
    errors: config_1.default.slackChannelsWebhooks.errors,
    deals: config_1.default.slackChannelsWebhooks.deals,
};
// Doing it this way to avoid using 3rd party services
// Verbose but works fine
function sendSlackMessage(message, type) {
    return new Promise((resolve) => {
        const body = JSON.stringify(message);
        const options = {
            hostname: 'hooks.slack.com',
            port: 443,
            path: slackChannels[type],
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
            },
        };
        const postReq = https.request(options, (res) => {
            const chunks = [];
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                return chunks.push(chunk);
            });
            res.on('end', () => {
                resolve({
                    body: chunks.join(''),
                    statusCode: res.statusCode,
                    statusMessage: res.statusMessage,
                });
            });
            return res;
        });
        postReq.write(body);
        postReq.end();
    });
}
function formatErrorToSlackBlock(stringifiedError, serverId) {
    return {
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: 'Fuck, something is wrong guys 😳',
                },
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Server ID: ${serverId}*`,
                },
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '```' + stringifiedError + '```',
                },
            },
        ],
    };
}
exports.formatErrorToSlackBlock = formatErrorToSlackBlock;
exports.default = sendSlackMessage;
//# sourceMappingURL=sendSlackMessage.js.map