import { ContractCallContext, ContractCallReturnContext } from '@maxime.julian/ethereum-multicall';
import BigNumber from 'bignumber.js';
import { Signer, BigNumber as EtherBigNumber } from 'ethers';

import { ExchangeIndex } from '@localTypes';

import { Token } from '@bot/src/types';

export interface IGetEstimateDecimalAmountOutInput {
  toTokenAddress: string;
  amountIn: EtherBigNumber;
  signer: Signer;
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
