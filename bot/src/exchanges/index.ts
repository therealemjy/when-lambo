import CryptoComExchange from './cryptoCom';
import SushiswapExchange from './sushiswap';
import UniswapV2Exchange from './uniswapV2';

const uniswapV2ExchangeService = new UniswapV2Exchange();
const sushiswapExchangeService = new SushiswapExchange();
const cryptoComExchangeService = new CryptoComExchange();

const exchanges = [uniswapV2ExchangeService, sushiswapExchangeService, cryptoComExchangeService];

export default exchanges;
