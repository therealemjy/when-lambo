import env from '@utils/env';

// @ts-ignore causes bug only on compilation for some reason, removing that would make the deployment fail
import { tradedTokens as prodTradedTokens } from '@root/bot.config';

export interface ConfigToken {
  ADDRESS: string;
  SYMBOL: string;
  DECIMALS: string;
}

const getTradedTokenAddresses = (useProdTradedTokens: boolean) => {
  const stringifiedTradedTokens: ConfigToken[] = process.env.USE_PROD_TRADED_TOKENS
    ? prodTradedTokens.flat()
    : JSON.parse(env('STRINGIFIED_TRADED_TOKENS'));

  const tradedTokenAddresses = stringifiedTradedTokens.reduce<string[]>((allTokenAddresses, tradedToken) => {
    if (allTokenAddresses.find((tokenAddress) => tokenAddress === tradedToken.ADDRESS)) {
      return allTokenAddresses;
    }

    return [...allTokenAddresses, tradedToken.ADDRESS];
  }, []);

  return tradedTokenAddresses;
};

export default getTradedTokenAddresses;
