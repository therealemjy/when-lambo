import { ContractCallContext, ContractCallReturnContext } from '@maxime.julian/ethereum-multicall';
import BigNumber from 'bignumber.js';

import { Token, ExchangeName } from '@src/types';

export type IGetDecimalAmountOutCallContextInput = {
  callReference: string;
  fromTokenDecimalAmounts: BigNumber[];
  fromToken: Token;
  toToken: Token;
};

export interface Exchange {
  name: ExchangeName;
  getDecimalAmountOutCallContext: (args: IGetDecimalAmountOutCallContextInput) => {
    context: ContractCallContext;
    resultFormatter: ResultFormatter;
  };
}

export type ResultFormatter = (result: ContractCallReturnContext) => FormattedDecimalAmountOutCallResult;

export type FormattedDecimalAmountOutCallResult = Array<{
  decimalAmountOut: BigNumber;
  estimatedGas: BigNumber;
}>;
