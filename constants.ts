export const LEDGER_OWNER_ACCOUNT_PATH = "44'/60'/0'/0/0";
export const OWNER_ACCOUNT_MAINNET_ADDRESS = '0x56bE12a70ef5d5E974b4716281356199564F23c3';
export const VAULT_ACCOUNT_MAINNET_ADDRESS = 'TO BE DEFINED';
// Estimated gas necessary to run the trade function of Transactor, without accounting for
// the gas necessary for the exchange swaps themselves (these are fetched separately, see
// fetchGasEstimates script)
export const TRADE_GAS_ESTIMATE_WITHOUT_SWAPS = 180000;
export const DIST_FOLDER_PATH = `${process.cwd()}/dist`;
export const SWAP_GAS_ESTIMATES_FILE_PATH = `${DIST_FOLDER_PATH}/swapGasEstimates.json`;
