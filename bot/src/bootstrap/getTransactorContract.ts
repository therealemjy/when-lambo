import { ethers, Signer } from 'ethers';

import hardhatTransactorContractInfo from '@deployments/localhost/Transactor.json';
import mainnetTransactorContractInfo from '@deployments/mainnet/Transactor.json';

import { Transactor as ITransactorContract } from '@chainHandler/typechain';

const getTransactorContract = (isProd: boolean, signer?: Signer) => {
  const contractInfo = isProd ? mainnetTransactorContractInfo : hardhatTransactorContractInfo;
  return new ethers.Contract(contractInfo.address, contractInfo.abi, signer) as ITransactorContract;
};

export default getTransactorContract;
