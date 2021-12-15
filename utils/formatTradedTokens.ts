import { ParsedTradedToken } from '@localTypes';

const formatTradedTokens = (parsedTradedTokens: ParsedTradedToken[]) =>
  parsedTradedTokens.map((parsedTradedToken) => ({
    address: parsedTradedToken.ADDRESS,
    symbol: parsedTradedToken.SYMBOL,
    decimals: +parsedTradedToken.DECIMALS,
  }));

export default formatTradedTokens;
