/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import { Provider } from '@ethersproject/providers';
import { Contract, Signer, utils } from 'ethers';

import type { IDyDxSoloMargin, IDyDxSoloMarginInterface } from '../IDyDxSoloMargin';

const _abi = [
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'number',
            type: 'uint256',
          },
        ],
        internalType: 'struct Account.Info[]',
        name: 'accounts',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'enum Actions.ActionType',
            name: 'actionType',
            type: 'uint8',
          },
          {
            internalType: 'uint256',
            name: 'accountId',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'bool',
                name: 'sign',
                type: 'bool',
              },
              {
                internalType: 'enum Types.AssetDenomination',
                name: 'denomination',
                type: 'uint8',
              },
              {
                internalType: 'enum Types.AssetReference',
                name: 'ref',
                type: 'uint8',
              },
              {
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
              },
            ],
            internalType: 'struct Types.AssetAmount',
            name: 'amount',
            type: 'tuple',
          },
          {
            internalType: 'uint256',
            name: 'primaryMarketId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'secondaryMarketId',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'otherAddress',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'otherAccountId',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
        ],
        internalType: 'struct Actions.ActionArgs[]',
        name: 'actions',
        type: 'tuple[]',
      },
    ],
    name: 'operate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export class IDyDxSoloMargin__factory {
  static readonly abi = _abi;
  static createInterface(): IDyDxSoloMarginInterface {
    return new utils.Interface(_abi) as IDyDxSoloMarginInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): IDyDxSoloMargin {
    return new Contract(address, _abi, signerOrProvider) as IDyDxSoloMargin;
  }
}
