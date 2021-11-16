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
const format_1 = __importDefault(require("date-fns/format"));
const config_1 = __importDefault(require("@src/config"));
const eventEmitter_1 = __importDefault(require("@src/eventEmitter"));
const calculateProfit_1 = __importDefault(require("@src/utils/calculateProfit"));
const sendSlackMessage_1 = __importDefault(require("@src/utils/sendSlackMessage"));
const logPaths = (paths, worksheet) => __awaiter(void 0, void 0, void 0, function* () {
    const slackBlocks = [];
    const tableRows = [];
    const worksheetRows = [];
    for (const path of paths) {
        const timestamp = (0, format_1.default)(path[0].timestamp, 'd/M/yy HH:mm:ss');
        const borrowedDec = path[0].fromTokenDecimalAmount.toFixed();
        const boughtDec = path[0].toTokenDecimalAmount.toFixed(0);
        const revenues = path[1].toTokenDecimalAmount.toFixed(0);
        const bestSellingExchangeName = path[0].exchangeName;
        const bestBuyingExchangeName = path[1].exchangeName;
        const gasCost = path[0].estimatedGasCost
            .plus(path[1].estimatedGasCost)
            // Added gasLimit margin
            .multipliedBy(config_1.default.gasLimitMultiplicator);
        const [profitDec, profitPercent] = (0, calculateProfit_1.default)({
            revenueDec: path[1].toTokenDecimalAmount,
            // Add gas cost to expense. Note that this logic only works because we
            // start and end the path with WETH
            expenseDec: path[0].fromTokenDecimalAmount.plus(gasCost),
        });
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
                            text: `*${path[0].fromToken.symbol} decimals borrowed:*\n${borrowedDec}`,
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Best selling exchange:*\n${bestSellingExchangeName}`,
                        },
                        {
                            type: 'mrkdwn',
                            text: `*${path[0].toToken.symbol} decimals bought:*\n${boughtDec}`,
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Best buying exchange:*\n${bestBuyingExchangeName}`,
                        },
                        {
                            type: 'mrkdwn',
                            text: `*${path[0].fromToken.symbol} decimals bought back:*\n${revenues}`,
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Gas cost (in wei):*\n${gasCost.toFixed()}`,
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Profit (in ${path[0].fromToken.symbol} decimals):*\n${profitDec.toFixed(0)}`,
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
            worksheetRows.push([
                timestamp,
                +borrowedDec,
                bestSellingExchangeName,
                +boughtDec,
                bestBuyingExchangeName,
                +revenues,
                +gasCost.toFixed(),
                +profitDec.toFixed(0),
                `${profitPercent}%`,
            ]);
        }
        // Log all paths in the console in development
        else if (config_1.default.isDev) {
            tableRows.push({
                Timestamp: timestamp,
                [`${path[0].fromToken.symbol} decimals borrowed`]: borrowedDec,
                'Best selling exchange': bestSellingExchangeName,
                [`${path[0].toToken.symbol} decimals bought`]: boughtDec,
                'Best buying exchange': bestBuyingExchangeName,
                [`${path[0].fromToken.symbol} decimals bought back`]: revenues,
                'Gas cost (in wei)': gasCost.toFixed(),
                [`Profit (in ${path[0].fromToken.symbol} decimals)`]: profitDec.toFixed(0),
                'Profit (%)': profitPercent + '%',
            });
        }
    }
    try {
        if (config_1.default.isProd && slackBlocks.length > 0) {
            // Send alert to slack
            yield (0, sendSlackMessage_1.default)({
                blocks: slackBlocks.flat(),
            }, 'deals');
        }
        if (config_1.default.isProd && worksheetRows.length > 0) {
            // Send row to Google Spreadsheet
            yield worksheet.addRows(worksheetRows);
        }
        if (config_1.default.isDev) {
            // Log paths in console
            console.table(tableRows);
        }
    }
    catch (err) {
        eventEmitter_1.default.emit('error', err);
    }
});
exports.default = logPaths;
//# sourceMappingURL=logPaths.js.map