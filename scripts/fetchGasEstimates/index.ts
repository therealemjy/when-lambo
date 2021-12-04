import hre from 'hardhat';

import config from '@config';

import wrapEth from '@chainHandler/utils/wrapEth';

import exchanges from '@bot/src/exchanges';
import { Token } from '@bot/src/types';

// @ts-ignore
const ethers = hre.ethers;

const tokens = config.strategies.reduce((allTokens, formattedStrategy) => {
  if (allTokens.find((token) => token.address === formattedStrategy.toToken.address)) {
    return allTokens;
  }

  return [...allTokens, formattedStrategy.toToken];
}, [] as Token[]);

const fetchGasEstimates = async () => {
  // Because this script will only ever be run locally on Hardhat's local network, we can use
  // the test owner account as signer
  const testOwner = await ethers.getNamedSigner('ownerAddress');
  const testOwnerAddress = await testOwner.getAddress();
  const testAmountIn = ethers.utils.parseEther('1.0');

  const rows: unknown[] = [];

  for (let e = 0; e < exchanges.length; e++) {
    const exchange = exchanges[e];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Wrap ETH to WETH on signer account
      await wrapEth(testOwner, testAmountIn, testOwnerAddress);

      // Fetch estimated gas
      const gasEstimate = await exchange.estimateGetDecimalAmountOut({
        signer: testOwner,
        amountIn: testAmountIn,
        toTokenAddress: token.address,
      });

      rows.push({
        'Exchange name': exchange.name,
        [`WETH -> ${token.symbol}`]: gasEstimate ? gasEstimate.toString() : 'N/A',
      });
    }
  }

  console.table(rows);
  console.log('\n');
};

fetchGasEstimates()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
