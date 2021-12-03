import { ContractCallContext, ContractCallReturnContext } from '@maxime.julian/ethereum-multicall';
import BigNumber from 'bignumber.js';
import { Signer } from 'ethers';

import { Token, ExchangeName } from '@src/types';

export interface IGetDecimalAmountOutCallContextInput {
  callReference: string;
  fromToken: Token;
  fromTokenDecimalAmounts: BigNumber[];
  toToken: Token;
}

export interface EstimateTransaction {
  wethDecimalAmount: BigNumber;
  toToken: Token;
}

export interface IInitializeInput {
  signer: Signer;
  estimateTransactions: EstimateTransaction[];
}

export interface Exchange {
  name: ExchangeName;
  initialize: (args: IInitializeInput) => Promise<void>;
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
