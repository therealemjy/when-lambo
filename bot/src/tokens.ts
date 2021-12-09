import { Token } from '@localTypes';
import { address as wethAddress } from '@resources/thirdPartyContracts/mainnet/weth.json';

export const ETH: Token = {
  symbol: 'ETH',
  address: '0x0000000000000000000000000000000000000000',
  decimals: 18,
};

export const WETH: Token = {
  symbol: 'WETH',
  address: wethAddress,
  decimals: 18,
};
