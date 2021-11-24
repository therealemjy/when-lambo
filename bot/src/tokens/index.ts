import Token from './Token';

export const ETH = new Token({
  symbol: 'ETH',
  address: '0x0000000000000000000000000000000000000000',
  decimals: 18,
});

export const WETH = new Token({
  symbol: 'WETH',
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  decimals: 18,
});
