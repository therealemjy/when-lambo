import config from '@config';
import logger from '@logger';

import { State } from '@bot/src/bootstrap';

// Only keeps the last 10 executions
const registerExecutionTime = (state: State): void => {
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
