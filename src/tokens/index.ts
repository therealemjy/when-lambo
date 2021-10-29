import Token from './Token';

export { Token };

export const WETH = new Token({
  symbol: 'WETH',
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  decimals: 18,
});

export const DAI = new Token({
  symbol: 'DAI',
  address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  decimals: 18,
});
