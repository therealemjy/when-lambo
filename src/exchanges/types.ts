import { ContractCallContext, ContractCallReturnContext } from '@maxime.julian/ethereum-multicall';
import BigNumber from 'bignumber.js';

import { Token, ExchangeName } from '@src/types';

export interface Exchange {
  name: ExchangeName;
  getDecimalAmountOutCallContext: (args: {
    callReference: string;
    fromTokenDecimalAmounts: BigNumber[];
    fromToken: Token;
    toToken: Token;
  }) => {
    context: ContractCallContext;
    resultFormatter: (
      result: ContractCallReturnContext,
      additionalArgs?: any // TODO: type properly
    ) => FormattedDecimalAmountOutCallResult;
  };
}

export type FormattedDecimalAmountOutCallResult = Array<{
  decimalAmountOut: BigNumber;
  estimatedGas: BigNumber;
}>;
