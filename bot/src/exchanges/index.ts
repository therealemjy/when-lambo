import { ExchangeIndex } from '@localTypes';

import cryptoComRouterContract from '@resources/thirdPartyContracts/mainnet/cryptoComRouter.json';
import sushiswapRouterContract from '@resources/thirdPartyContracts/mainnet/sushiswapRouter.json';
import uniswapV2RouterInfo from '@resources/thirdPartyContracts/mainnet/uniswapV2Router.json';

import UniswapLikeExchange from './UniswapLikeExchange';

const uniswapV2ExchangeService = new UniswapLikeExchange({
  index: ExchangeIndex.UniswapV2,
  routerContractInfo: uniswapV2RouterInfo,
});

const sushiswapExchangeService = new UniswapLikeExchange({
  index: ExchangeIndex.Sushiswap,
  routerContractInfo: sushiswapRouterContract,
});

const cryptoComExchangeService = new UniswapLikeExchange({
  index: ExchangeIndex.CryptoCom,
  routerContractInfo: cryptoComRouterContract,
});

const exchanges = [uniswapV2ExchangeService, sushiswapExchangeService, cryptoComExchangeService];

export default exchanges;
