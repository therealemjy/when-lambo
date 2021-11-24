import { GoogleSpreadsheet } from 'google-spreadsheet';

import config from '@src/config';

const getSpreadsheet = async () => {
  // Initialize Google Spreadsheet instance
  const spreadsheet = new GoogleSpreadsheet(config.googleSpreadSheet.id);

  await spreadsheet.useServiceAccountAuth({
    client_email: config.googleSpreadSheet.clientEmail,
    private_key: Buffer.from(config.googleSpreadSheet.privateKeyBase64, 'base64').toString('ascii'),
  });

  await spreadsheet.loadInfo();

  return spreadsheet;
};

export default getSpreadsheet;
