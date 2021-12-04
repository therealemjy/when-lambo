import 'console.table';
import { BigNumber, Signer } from 'ethers';
import { ethers, getNamedAccounts } from 'hardhat';

import config from '@config';

import cryptoComRouterInfo from '@resources/thirdPartyContracts/mainnet/cryptoComRouter.json';
import sushiswapRouterInfo from '@resources/thirdPartyContracts/mainnet/sushiswapRouter.json';
import uniswapV2RouterInfo from '@resources/thirdPartyContracts/mainnet/uniswapV2Router.json';
import wethInfo from '@resources/thirdPartyContracts/mainnet/weth.json';

import wrapEth from '@chainHandler/utils/wrapEth';

import Token from '@bot/src/tokens/Token';
import { ExchangeIndex } from '@bot/src/types';

export interface EstimateTransaction {
  wethDecimalAmount: BigNumber;
  toToken: Token;
}

interface ExchangeContract {
  index: ExchangeIndex;
  address: string;
  abi: string;
}

const exchangeContracts: ExchangeContract[] = [
  {
    index: ExchangeIndex.Sushiswap,
    address: uniswapV2RouterInfo.address,
    abi: uniswapV2RouterInfo.address,
  },
  {
    index: ExchangeIndex.UniswapV2,
    address: sushiswapRouterInfo.address,
    abi: sushiswapRouterInfo.address,
  },
  {
    index: ExchangeIndex.CryptoCom,
    address: cryptoComRouterInfo.address,
    abi: cryptoComRouterInfo.address,
  },
];

const estimateSwapGas = async (
  exchangeContract: ExchangeContract,
  tokenAddress: string,
  signer: Signer
): Promise<BigNumber> => {
  const signerAddress = await signer.getAddress();

  // Wrap ETH to WETH on signer account
  const amountIn = ethers.utils.parseEther('1.0');
  await wrapEth(ethers, signer, amountIn, signerAddress);

  const weth = new ethers.Contract(wethInfo.address, wethInfo.abi, signer);
  await weth.approve(exchangeContract.address, amountIn);

  const path = [wethInfo.address, tokenAddress];

  const contract = new ethers.Contract(exchangeContract.address, uniswapV2RouterInfo.abi, signer);

  const transaction = await contract.swapExactTokensForTokens(
    amountIn,
    1, // Min toToken amount out
    path,
    signerAddress,
    new Date(new Date().getTime() + 120000).getTime()
  );

  // Wait for transaction to get mined (instantaneously in our case since we're running on
  // Hardhat's local network)
  const receipt = await transaction.wait();
  return receipt.gasUsed;
};

const tokens = config.strategies.reduce((allTokens, formattedStrategy) => {
  if (allTokens.find((token) => token.address === formattedStrategy.toToken.address)) {
    return allTokens;
  }

  return [...allTokens, formattedStrategy.toToken];
}, [] as Token[]);

describe('ExchangeTests', function () {
  it('Exchanges', async function () {
    const { ownerAddress } = await getNamedAccounts();
    const owner = await ethers.getSigner(ownerAddress);
    const rows: unknown[] = [];

    for (let e = 0; e < exchangeContracts.length; e++) {
      const exchangeContract = exchangeContracts[e];

      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const gasEstimate = await estimateSwapGas(exchangeContract, token.address, owner).catch((error) => {
          if (error.message === 'Transaction reverted without a reason string') {
            // If we get this error message, then it means the exchange simply does not have
            // any pool containing WETH and the token we want to trade
            return undefined;
          }

          throw error;
        });

        rows.push({
          'Exchange index': exchangeContract.index,
          [`WETH -> ${token.symbol}`]: gasEstimate ? gasEstimate.toString() : 'N/A',
        });
      }
    }

    console.table(rows);
    console.log('\n');
  });
});
