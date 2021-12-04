import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';

import { Path } from '@bot/src/types';

export interface MessageEvents {
  error: (error: unknown) => void;
  paths: (blockNumber: string, paths: Path[]) => void;
}

const eventEmitter = new EventEmitter() as TypedEmitter<MessageEvents>;

export default eventEmitter;
