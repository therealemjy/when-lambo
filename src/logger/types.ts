export type WorksheetRow = [
  string, // Timestamp
  string, // Block number
  number, // WETH borrowed
  string, // Best selling exchange
  string, // Token
  number, // Tokens bought
  string, // Best buying exchange
  number, // Revenues (in WETH)
  number, // Gas cost (in ETH)
  number, // Profit (in WETH)
  string // Profit (%)
];
