import { ContractCallContext } from '@maxime.julian/ethereum-multicall';
import { Multicall } from '@maxime.julian/ethereum-multicall';
import BigNumber from 'bignumber.js';

import { Exchange, ResultFormatter } from '@src/types';

import { Token } from './types';

const monitorPrices = async ({
  multicall,
  refTokenDecimalAmounts,
  refToken,
  tradedToken,
  exchanges,
  slippageAllowancePercent,
  gasPriceWei,
}: {
  multicall: Multicall;
  refTokenDecimalAmounts: BigNumber[];
  refToken: Token;
  tradedToken: Token;
  slippageAllowancePercent: number;
  gasPriceWei: BigNumber;
  exchanges: Exchange[];
}) => {
  const resultFormatters: ResultFormatter[] = [];

  const multicallContexts = exchanges.reduce<ContractCallContext[]>((contexts, exchange) => {
    const { context, resultFormatter } = exchange.getDecimalAmountOutCallContext({
      callReference: exchange.name,
      fromTokenDecimalAmounts: refTokenDecimalAmounts,
      fromToken: refToken,
      toToken: tradedToken,
    });

    resultFormatters.push(resultFormatter);
    return [...contexts, context];
  }, []);

  const multicallRes = await multicall.call(multicallContexts, {
    gasLimit: 999999999999999, // Add stupid value to prevent issues with view functions running out of gas
  });

  console.log(multicallRes.results['Uniswap V2'].originalContractCallContext);

  return [];
};

export default monitorPrices;
