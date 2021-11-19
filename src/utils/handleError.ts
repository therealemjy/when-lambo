import config from '@src/config';
import logger from '@src/logger';
import formatError from '@src/utils/formatError';
import sendSlackMessage, { formatErrorToSlackBlock } from '@src/utils/sendSlackMessage';

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
