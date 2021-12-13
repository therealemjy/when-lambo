import logger from '@logger';

import config from '@bot/config';
import { Services } from '@bot/src/types';

// Only keeps the last 10 executions
const registerExecutionTime = ({ state }: Services): void => {
  const currentDateTime = new Date().getTime();
  const executionTimeMS = currentDateTime - state.botExecutionMonitoringTick;

  if (config.isDev) {
    logger.log(`[PERF] - Executed in ${executionTimeMS}ms.`);
  }

  // Used for perf "How long on average does it take to monitor prices"
  state.perfMonitoringRecords.push(executionTimeMS);

  // Used for health check "When was the last execution"
  state.lastMonitoringDateTime = currentDateTime;

  if (state.perfMonitoringRecords.length === 21) {
    state.perfMonitoringRecords.shift();
  }
};

export default registerExecutionTime;
