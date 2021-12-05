import logger from '@logger';
import * as Sentry from '@sentry/node';

import config from '@bot/config';
import formatError from '@bot/src/utils/formatError';

const handleError = (error: unknown, isUncaughtException = false) => {
  // Format the error to a human-readable format and send it to slack
  const formattedError = formatError(error);
  logger.error(isUncaughtException ? 'Uncaught exception:' : 'Emitted error:', formattedError);

  if (config.isProd) {
    Sentry.captureException(error, {
      tags: {
        serverId: config.serverId,
      },
    });
  }
};

export default handleError;
