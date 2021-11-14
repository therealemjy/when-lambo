import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';

import { Path } from '@src/types';

interface MessageEvents {
  error: (error: unknown) => void;
  paths: (paths: Path[]) => void;
}

const eventEmitter = new EventEmitter() as TypedEmitter<MessageEvents>;

export default eventEmitter;
