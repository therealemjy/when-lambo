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
const bunyan_1 = __importDefault(require("bunyan"));
const bunyan_rotating_file_stream_1 = __importDefault(require("bunyan-rotating-file-stream"));
require("console.table");
const config_1 = __importDefault(require("@src/bootstrap/config"));
const eventEmitter_1 = __importDefault(require("@src/bootstrap/eventEmitter"));
const tokens_1 = require("@src/tokens");
const calculateProfit_1 = __importDefault(require("@src/utils/calculateProfit"));
const formatTimestamp_1 = __importDefault(require("@src/utils/formatTimestamp"));
const sendSlackMessage_1 = __importDefault(require("@src/utils/sendSlackMessage"));
const bunyanLogger = bunyan_1.default.createLogger({
    name: 'bot',
    serializers: bunyan_1.default.stdSerializers,
});
// Save logs in files in prod
if (config_1.default.isProd) {
    bunyanLogger.addStream({
        // @ts-ignore For some reason, the type definition of RotatingFileStream is incorrect
        stream: new bunyan_rotating_file_stream_1.default({
            path: `/var/tmp/logs.log`,
            period: '1d',
            totalFiles: 3,
            rotateExisting: true,
        }),
    });
}
const log = (...args) => bunyanLogger.info(...args);
const error = (...args) => bunyanLogger.error(...args);
const table = console.table;
const _convertToHumanReadableAmount = (amount, tokenDecimals) => amount.dividedBy(Math.pow(10, tokenDecimals)).toFixed(tokenDecimals);
const paths = (blockNumber, pathsToLog, spreadsheet) => __awaiter(void 0, void 0, void 0, function* () {
    const slackBlocks = [];
    const tableRows = [];
    const worksheetRows = [];
    for (const path of pathsToLog) {
        const timestamp = (0, formatTimestamp_1.default)(path[0].timestamp);
        const borrowedTokens = _convertToHumanReadableAmount(path[0].fromTokenDecimalAmount, path[0].fromToken.decimals);
        const boughtTokens = _convertToHumanReadableAmount(path[0].toTokenDecimalAmount, path[0].toToken.decimals);
        const revenues = _convertToHumanReadableAmount(path[1].toTokenDecimalAmount, path[1].toToken.decimals);
        const bestSellingExchangeName = path[0].exchangeName;
        const bestBuyingExchangeName = path[1].exchangeName;
        const gasCost = path[0].estimatedGasCost
            .plus(path[1].estimatedGasCost)
            // Add gasLimit margin
            .multipliedBy(config_1.default.gasLimitMultiplicator);
        const gasCostWETH = _convertToHumanReadableAmount(gasCost, tokens_1.WETH.decimals);
        const [profitDec, profitPercent] = (0, calculateProfit_1.default)({
            revenueDec: path[1].toTokenDecimalAmount,
            // Add gas cost to expense. Note that this logic only works because we
            // start and end the path with WETH
            expenseDec: path[0].fromTokenDecimalAmount.plus(gasCost),
        });
        const profitTokens = _convertToHumanReadableAmount(profitDec, path[0].fromToken.decimals);
        // Only log profitable paths in production
        if (config_1.default.isProd && profitDec.isGreaterThan(0)) {
            slackBlocks.push([
                {
                    type: 'section',
                    fields: [
                        {
                            type: 'mrkdwn',
                            text: `*Timestamp:*\n${timestamp}`,
                        },
                        {
                            type: 'mrkdwn',
                            text: `*${path[0].fromToken.symbol} borrowed:*\n${borrowedTokens}`,
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Best selling exchange:*\n${bestSellingExchangeName}`,
                        },
                        {
                            type: 'mrkdwn',
                            text: `*${path[0].toToken.symbol} bought:*\n${boughtTokens}`,
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Best buying exchange:*\n${bestBuyingExchangeName}`,
                        },
                        {
                            type: 'mrkdwn',
                            text: `*${path[0].fromToken.symbol} bought back:*\n${revenues}`,
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Gas cost (in wei):*\n${gasCost}`,
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Profit (in ${path[0].fromToken.symbol}):*\n${profitTokens}`,
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Profit (%):*\n${profitPercent}%`,
                        },
                    ],
                },
                {
                    type: 'divider',
                },
            ]);
            // Add row
            worksheetRows.push([
                timestamp,
                blockNumber,
                +borrowedTokens,
                bestSellingExchangeName,
                path[0].toToken.symbol,
                +boughtTokens,
                bestBuyingExchangeName,
                +revenues,
                +gasCostWETH,
                +profitTokens,
                `${profitPercent}%`,
            ]);
        }
        // Log all paths in the console in development
        else if (config_1.default.isDev) {
            tableRows.push({
                Timestamp: timestamp,
                [`${path[0].fromToken.symbol} borrowed`]: borrowedTokens,
                'Best selling exchange': bestSellingExchangeName,
                [`${path[0].toToken.symbol} bought`]: boughtTokens,
                'Best buying exchange': bestBuyingExchangeName,
                [`${path[0].fromToken.symbol} bought back`]: revenues,
                'Gas cost (in WETH)': gasCostWETH,
                [`Profit (in ${path[0].fromToken.symbol})`]: profitTokens,
                'Profit (%)': profitPercent + '%',
            });
        }
    }
    // Log paths in console in dev
    if (config_1.default.isDev) {
        table(tableRows);
        return;
    }
    // Send profitable paths to slack in prod
    if (slackBlocks.length > 0) {
        (0, sendSlackMessage_1.default)({
            blocks: slackBlocks.flat(),
        }, 'deals').catch((err) => eventEmitter_1.default.emit('error', err));
    }
    // Then update the Google Spreadsheet document
    if (worksheetRows.length > 0) {
        const worksheet = spreadsheet.sheetsByIndex[0];
        worksheet.addRows(worksheetRows).catch((err) => eventEmitter_1.default.emit('error', err));
    }
});
exports.default = {
    log,
    error,
    table,
    paths,
};
//# sourceMappingURL=index.js.map