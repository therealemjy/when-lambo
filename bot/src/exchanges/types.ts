import { ContractCallContext, ContractCallReturnContext } from '@maxime.julian/ethereum-multicall';
import BigNumber from 'bignumber.js';

import { Token, ExchangeName } from '@src/types';

export type IGetDecimalAmountOutCallContextInput = {
  callReference: string;
  fromToken: Token;
  fromTokenDecimalAmounts: BigNumber[];
  toToken: Token;
};

export interface Exchange {
  name: ExchangeName;
  getDecimalAmountOutCallContext: (args: IGetDecimalAmountOutCallContextInput) => {
    context: ContractCallContext;
    resultsFormatter: ResultsFormatter;
  };
}

export type ResultsFormatter = (
  result: ContractCallReturnContext,
  callParameters: { fromToken: Token; toToken: Token }
) => FormattedGetDecimalAmountOutResult[];

export interface FormattedGetDecimalAmountOutResult {
  fromToken: Token;
  fromTokenDecimalAmount: BigNumber;
  toToken: Token;
  toTokenDecimalAmount: BigNumber;
  estimatedGas: BigNumber;
}