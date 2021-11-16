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
const axios_1 = __importDefault(require("axios"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const config_1 = __importDefault(require("@src/config"));
const eventEmitter_1 = __importDefault(require("@src/eventEmitter"));
class GasPriceWatcher {
    constructor() {
        console.log('Gas price watcher started.');
        this.getPrices();
    }
    updateEvery(interval) {
        return __awaiter(this, void 0, void 0, function* () {
            setInterval(this.getPrices, interval);
        });
    }
    getPrices() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield axios_1.default.get('https://etherchain.org/api/gasnow');
                global.currentGasPrices = {
                    // In order to make sure transactions are mined as fast as possible, we
                    // multiply the gas price for rapid transactions by a given
                    // multiplicator
                    rapid: new bignumber_js_1.default(res.data.data.rapid).multipliedBy(config_1.default.gasPriceMultiplicator),
                    fast: new bignumber_js_1.default(res.data.data.fast),
                    standard: new bignumber_js_1.default(res.data.data.standard),
                    slow: new bignumber_js_1.default(res.data.data.slow),
                };
            }
            catch (err) {
                eventEmitter_1.default.emit('error', err);
            }
        });
    }
}
exports.default = new GasPriceWatcher();
//# sourceMappingURL=index.js.map