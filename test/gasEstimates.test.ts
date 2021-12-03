import 'console.table';
import { BigNumber, Signer } from 'ethers';
import { ethers, deployments, getNamedAccounts } from 'hardhat';

import cryptoComRouterInfo from '@resources/thirdPartyContracts/mainnet/cryptoComRouter.json';
import sushiswapRouterInfo from '@resources/thirdPartyContracts/mainnet/sushiswapRouter.json';
import uniswapV2RouterInfo from '@resources/thirdPartyContracts/mainnet/uniswapV2Router.json';
import wethInfo from '@resources/thirdPartyContracts/mainnet/weth.json';

import wrapEth from '@chainHandler/utils/wrapEth';

import Token from '@bot/src/tokens/Token';
import { ExchangeName } from '@bot/src/types';
import formatStrategies, { ParsedStrategy } from '@bot/src/utils/formatStrategies';

const parsedStrategies: ParsedStrategy[] = JSON.parse(process.env.STRINGIFIED_STRATEGIES!);

export interface EstimateTransaction {
  wethDecimalAmount: BigNumber;
  toToken: Token;
}

interface ExchangeContract {
  name: ExchangeName;
  address: string;
  abi: string;
}

const exchangeContracts: ExchangeContract[] = [
  {
    name: ExchangeName.Sushiswap,
    address: uniswapV2RouterInfo.address,
    abi: uniswapV2RouterInfo.address,
  },
  {
    name: ExchangeName.UniswapV2,
    address: sushiswapRouterInfo.address,
    abi: sushiswapRouterInfo.address,
  },
  {
    name: ExchangeName.CryptoCom,
    address: cryptoComRouterInfo.address,
    abi: cryptoComRouterInfo.address,
  },
];

const estimateSwapGas = async (
  exchangeContract: ExchangeContract,
  amountIn: BigNumber,
  tokenAddress: string,
  signer: Signer
): Promise<BigNumber> => {
  const signerAddress = await signer.getAddress();

  // Wrap ETH to WETH on signer account
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

const formattedStrategies = formatStrategies(parsedStrategies, +process.env.STRATEGY_BORROWED_AMOUNTS_COUNT!);

const estimateTransactions = formattedStrategies.reduce((allEstimateTransactions, formattedStrategy) => {
  if (
    allEstimateTransactions.find(
      (allEstimateTransaction) => allEstimateTransaction.toToken.address === formattedStrategy.toToken.address
    )
  ) {
    return allEstimateTransactions;
  }

  const estimateTransaction: EstimateTransaction = {
    toToken: formattedStrategy.toToken,
    wethDecimalAmount: ethers.BigNumber.from(formattedStrategy.borrowedWethAmounts[0].toString()),
  };

  return [...allEstimateTransactions, estimateTransaction];
}, [] as EstimateTransaction[]);

const setup = deployments.createFixture(async () => {
  await deployments.fixture(['Transactor']);
});

describe.only('ExchangeTests', function () {
  it('Exchanges', async function () {
    await setup();

    const { ownerAddress } = await getNamedAccounts();
    const owner = await ethers.getSigner(ownerAddress);
    const rows: unknown[] = [];

    for (let e = 0; e < exchangeContracts.length; e++) {
      const exchangeContract = exchangeContracts[e];

      for (let i = 0; i < estimateTransactions.length; i++) {
        const estimateTransaction = estimateTransactions[i];
        const gasEstimate = await estimateSwapGas(
          exchangeContract,
          estimateTransaction.wethDecimalAmount,
          estimateTransaction.toToken.address,
          owner
        );

        rows.push({
          'Exchange contract': exchangeContract.name,
          [`WETH -> ${estimateTransaction.toToken.symbol}`]: gasEstimate.toString(),
        });
      }
    }

    console.table(rows);
    console.log('\n');
  });
});
