import { BigNumber } from 'ethers';
import TypedEmitter from 'typed-emitter';

import { ExchangeIndex, Token, LoanAmounts, GasFees } from '@localTypes';
import logger from '@logger';

import { EnvConfig } from '@bot/config';
import { MessageEvents } from '@bot/src/eventEmitter';
import UniswapLikeExchange from '@bot/src/exchanges/UniswapLikeExchange';
import { Exchange, ResultsFormatter, IGetDecimalAmountOutCallContextInput } from '@bot/src/exchanges/types';

import Messenger from './bootstrap/messenger';

export type { Exchange, ResultsFormatter, IGetDecimalAmountOutCallContextInput };

export type Services = {
  state: State;
  config: EnvConfig;
  logger: typeof logger;
  exchanges: UniswapLikeExchange[];
  eventEmitter: TypedEmitter<MessageEvents>;
  messenger?: Messenger;
};

export type State = {
  isMonitoringActivated: boolean;
  lastMonitoringDateTime?: number;
  lastGasPriceUpdateDateTime?: number;
  botExecutionMonitoringTick: number;
  perfMonitoringRecords: number[];
  loanAmounts: LoanAmounts;
  gasFees?: GasFees;
};

export interface Deal {
  timestamp: Date;
  exchangeIndex: ExchangeIndex;
  fromToken: Token;
  fromTokenDecimalAmount: BigNumber;
  toToken: Token;
  toTokenDecimalAmount: BigNumber;
  slippageAllowancePercent: number;
  gasEstimate: BigNumber;
  gasCostEstimate: BigNumber;
}

export type Path = [Deal, Deal];

export interface Trade {
  blockNumber: number;
  path: Path;
  totalGasCost: BigNumber;
  profitWethAmount: BigNumber;
  profitPercentage: number;
  gasSettings: GasFees & {
    gasLimit: number;
  };
}

export type UsedExchangeIndexes = {
  [fixedDecimalAmount: string]: ExchangeIndex;
};
