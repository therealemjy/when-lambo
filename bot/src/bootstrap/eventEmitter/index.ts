import BigNumber from 'bignumber.js';
import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';

import { Path } from '@bot/src/types';

export interface MessageEvents {
  error: (error: unknown) => void;
  trade: (blockNumber: number, path: Path, gasPriceWei: BigNumber) => void;
}

const eventEmitter = new EventEmitter() as TypedEmitter<MessageEvents>;

export default eventEmitter;
