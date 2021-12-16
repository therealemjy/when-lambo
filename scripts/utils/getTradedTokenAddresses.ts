import { ParsedTradedToken } from '@localTypes';

const getTradedTokenAddresses = (stringifiedTradedTokens: ParsedTradedToken[]) => {
  const tradedTokenAddresses = stringifiedTradedTokens.reduce<string[]>((allTokenAddresses, tradedToken) => {
    if (allTokenAddresses.find((tokenAddress) => tokenAddress === tradedToken.ADDRESS)) {
      return allTokenAddresses;
    }

    return [...allTokenAddresses, tradedToken.ADDRESS];
  }, []);

  return tradedTokenAddresses;
};

export default getTradedTokenAddresses;
