"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_js_1 = __importDefault(require("bignumber.js"));
// This is a util used in dev only, to make nested BigNumber values inside an
// object human-readable
const improveReadability = (source) => Object.keys(source).reduce((convertedObject, key) => {
    let value = source[key];
    if (value instanceof bignumber_js_1.default) {
        value = value.toFixed();
    }
    else if (typeof value === 'object' && value && !(value instanceof Date)) {
        value = improveReadability(value);
    }
    return Object.assign(Object.assign({}, convertedObject), { [key]: value });
}, {});
exports.default = improveReadability;
//# sourceMappingURL=improveReadability.js.map