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
const google_spreadsheet_1 = require("google-spreadsheet");
const config_1 = __importDefault(require("../config"));
const getWorksheet = () => __awaiter(void 0, void 0, void 0, function* () {
    // Initialize Google Spreadsheet instance
    const spreadsheet = new google_spreadsheet_1.GoogleSpreadsheet(config_1.default.googleSpreadSheet.worksheetId);
    yield spreadsheet.useServiceAccountAuth({
        client_email: config_1.default.googleSpreadSheet.clientEmail,
        private_key: Buffer.from(config_1.default.googleSpreadSheet.privateKeyBase64, 'base64').toString('ascii'),
    });
    yield spreadsheet.loadInfo();
    return spreadsheet.sheetsByIndex[0];
});
exports.default = getWorksheet;
//# sourceMappingURL=getWorksheet.js.map