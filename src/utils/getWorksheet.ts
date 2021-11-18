import { GoogleSpreadsheet } from 'google-spreadsheet';

import config from '../config';

const getWorksheet = async (worksheetId: string) => {
  // Initialize Google Spreadsheet instance
  const spreadsheet = new GoogleSpreadsheet(worksheetId);

  await spreadsheet.useServiceAccountAuth({
    client_email: config.googleSpreadSheet.clientEmail,
    private_key: Buffer.from(config.googleSpreadSheet.privateKeyBase64, 'base64').toString('ascii'),
  });
  await spreadsheet.loadInfo();

  return spreadsheet.sheetsByIndex[0];
};
export default getWorksheet;
