import { ethers, Signer } from 'ethers';

import hardhatTransactorContractInfo from '@deployments/localhost/Transactor.json';
// TODO: import real mainnet contract info once it's been deployed
import mainnetTransactorContractInfo from '@deployments/localhost/Transactor.json';

import { Transactor as ITransactorContract } from '@chainHandler/typechain';

const getTransactorContract = (signer: Signer, isProd: boolean) => {
  const contractInfo = isProd ? mainnetTransactorContractInfo : hardhatTransactorContractInfo;
  return new ethers.Contract(contractInfo.address, contractInfo.abi, signer) as ITransactorContract;
};

export default getTransactorContract;
