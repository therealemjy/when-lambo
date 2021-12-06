import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';

export type IEventEmitter = TypedEmitter<MessageEvents>;

export interface MessageEvents {
  error: (error: unknown) => void;
}

const eventEmitter = new EventEmitter() as IEventEmitter;

export default eventEmitter;
