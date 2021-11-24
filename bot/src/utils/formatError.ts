import { serializeError } from 'serialize-error';

const formatError = (error: unknown) => {
  const serialized = serializeError(error);
  return JSON.stringify(serialized, null, 2);
};

export default formatError;
