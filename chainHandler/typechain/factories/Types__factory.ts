/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type { Types, TypesInterface } from "../Types";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "c__0x6e550cd2",
        type: "bytes32",
      },
    ],
    name: "c_0x6e550cd2",
    outputs: [],
    stateMutability: "pure",
    type: "function",
  },
];

const _bytecode =
  "0x60e0610052600b82828239805160001a607314610045577f4e487b7100000000000000000000000000000000000000000000000000000000600052600060045260246000fd5b30600052607381538281f3fe730000000000000000000000000000000000000000301460806040526004361060335760003560e01c8063fe69e000146038575b600080fd5b604e6004803603810190604a91906066565b6050565b005b50565b6000813590506060816096565b92915050565b600060208284031215607757600080fd5b60006083848285016053565b91505092915050565b6000819050919050565b609d81608c565b811460a757600080fd5b5056fea2646970667358221220fab1c01d3eb4ed830a4001f671be0585398882f18728de3d0163a9ce38ffea8664736f6c63430008040033";

export class Types__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<Types> {
    return super.deploy(overrides || {}) as Promise<Types>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): Types {
    return super.attach(address) as Types;
  }
  connect(signer: Signer): Types__factory {
    return super.connect(signer) as Types__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TypesInterface {
    return new utils.Interface(_abi) as TypesInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Types {
    return new Contract(address, _abi, signerOrProvider) as Types;
  }
}
