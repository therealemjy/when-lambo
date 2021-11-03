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

export const DAI = new Token({
  symbol: 'DAI',
  address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  decimals: 18,
});

export const SHIB = new Token({
  symbol: 'SHIB',
  address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
  decimals: 18,
});

export const AAVE = new Token({
  symbol: 'AAVE',
  address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
  decimals: 18,
});

export const LINK = new Token({
  symbol: 'LINK',
  address: '0x514910771af9ca656af840dff83e8264ecf986ca',
  decimals: 18,
});

export const SAND = new Token({
  symbol: 'SAND',
  address: '0x3845badade8e6dff049820680d1f14bd3903a5d0',
  decimals: 18,
});

export const MANA = new Token({
  symbol: 'MANA',
  address: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
  decimals: 18,
});
