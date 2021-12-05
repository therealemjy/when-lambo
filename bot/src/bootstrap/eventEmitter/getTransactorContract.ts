import { ethers, Signer } from 'ethers';

// TODO: import mainnet info once contract has been deployed on it
import transactorContractInfo from '@deployments/localhost/Transactor.json';

import { Transactor as ITransactorContract } from '@chainHandler/typechain';

const getTransactorContract = (signer: Signer) =>
  new ethers.Contract(transactorContractInfo.address, transactorContractInfo.abi, signer) as ITransactorContract;

export default getTransactorContract;
