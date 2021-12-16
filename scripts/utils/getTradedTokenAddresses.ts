export interface ConfigToken {
  ADDRESS: string;
  SYMBOL: string;
  DECIMALS: string;
}

const getTradedTokenAddresses = (stringifiedTradedTokens: ConfigToken[]) => {
  const tradedTokenAddresses = stringifiedTradedTokens.reduce<string[]>((allTokenAddresses, tradedToken) => {
    if (allTokenAddresses.find((tokenAddress) => tokenAddress === tradedToken.ADDRESS)) {
      return allTokenAddresses;
    }

    return [...allTokenAddresses, tradedToken.ADDRESS];
  }, []);

  return tradedTokenAddresses;
};

export default getTradedTokenAddresses;
