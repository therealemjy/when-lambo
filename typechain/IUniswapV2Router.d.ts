/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface IUniswapV2RouterInterface extends ethers.utils.Interface {
  functions: {
    "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "swapExactTokensForTokens",
    values: [BigNumberish, BigNumberish, string[], string, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "swapExactTokensForTokens",
    data: BytesLike
  ): Result;

  events: {};
}

export class IUniswapV2Router extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: IUniswapV2RouterInterface;

  functions: {
    swapExactTokensForTokens(
      amountIn: BigNumberish,
      amountOutMin: BigNumberish,
      path: string[],
      to: string,
      deadline: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  swapExactTokensForTokens(
    amountIn: BigNumberish,
    amountOutMin: BigNumberish,
    path: string[],
    to: string,
    deadline: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    swapExactTokensForTokens(
      amountIn: BigNumberish,
      amountOutMin: BigNumberish,
      path: string[],
      to: string,
      deadline: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;
  };

  filters: {};

  estimateGas: {
    swapExactTokensForTokens(
      amountIn: BigNumberish,
      amountOutMin: BigNumberish,
      path: string[],
      to: string,
      deadline: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    swapExactTokensForTokens(
      amountIn: BigNumberish,
      amountOutMin: BigNumberish,
      path: string[],
      to: string,
      deadline: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
