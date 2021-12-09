import { ContractCallContext, ContractCallReturnContext } from '@maxime.julian/ethereum-multicall';
import { Signer, BigNumber } from 'ethers';

import { ExchangeIndex, Token } from '@localTypes';

export interface IGetEstimateDecimalAmountOutInput {
  toTokenAddress: string;
  amountIn: BigNumber;
  signer: Signer;
  isProd: boolean;
}

export interface IGetDecimalAmountOutCallContextInput {
  callReference: string;
  fromToken: Token;
  fromTokenDecimalAmounts: BigNumber[];
  toToken: Token;
}

export interface Exchange {
  name: string;
  index: ExchangeIndex;
  estimateGetDecimalAmountOut: (args: IGetEstimateDecimalAmountOutInput) => Promise<BigNumber | undefined>;
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
}
