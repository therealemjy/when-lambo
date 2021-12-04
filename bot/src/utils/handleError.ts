import config from '@config';
import logger from '@logger';

import formatError from '@bot/src/utils/formatError';
import sendSlackMessage, { formatErrorToSlackBlock } from '@bot/src/utils/sendSlackMessage';

const handleError = (error: unknown, isUncaughtException = false) => {
  // Format the error to a human-readable format and send it to slack
  const formattedError = formatError(error);
  logger.error(isUncaughtException ? 'Uncaught exception:' : 'Emitted error:', formattedError);

  if (config.isProd) {
    const slackBlock = formatErrorToSlackBlock(formattedError, config.serverId);
    sendSlackMessage(slackBlock, 'errors');
  }
};

export default handleError;
