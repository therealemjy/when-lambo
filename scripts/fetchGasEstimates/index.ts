import hre from 'hardhat';

import config from '@config';

// @ts-ignore
const ethers = hre.ethers;

const fetchGasEstimates = async () => {
  // Because this script will only ever be run locally on Hardhat's local network, we can use
  // the test owner account as signer
  const testOwnerAddress = config.testAccountAddresses.owner;
  const owner = new ethers.Wallet(testOwnerAddress, ethers.provider);

  console.log(owner);
};

fetchGasEstimates()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
