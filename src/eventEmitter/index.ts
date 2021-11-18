import EventEmitter from 'events';
import { GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import TypedEmitter from 'typed-emitter';

import { Path } from '@src/types';

interface MessageEvents {
  error: (error: unknown) => void;
  paths: (paths: Path[], worksheet: GoogleSpreadsheetWorksheet) => void;
}

const eventEmitter = new EventEmitter() as TypedEmitter<MessageEvents>;

export default eventEmitter;
