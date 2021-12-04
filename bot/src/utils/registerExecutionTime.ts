import config from '@config';
import logger from '@logger';

// Only keeps the last 10 executions
const registerExecutionTime = (): void => {
  const currentDateTime = new Date().getTime();
  const executionTimeMS = currentDateTime - global.botExecutionMonitoringTick;

  if (config.isDev) {
    logger.log(`[PERF] - Executed in ${executionTimeMS}ms.`);
  }

  // Used for perf "How long on average does it take to monitor prices"
  global.perfMonitoringRecords.push(executionTimeMS);

  // Used for health check "When was the last execution"
  global.lastMonitoringDateTime = currentDateTime;

  if (global.perfMonitoringRecords.length === 21) {
    global.perfMonitoringRecords.shift();
  }
};

export default registerExecutionTime;
