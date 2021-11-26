export const setupGlobalStateVariables = () => {
  global.isMonitoring = false;
  global.lastMonitoringDateTime = null;
  global.botExecutionMonitoringTick = 0;
  global.perfMonitoringRecords = [];
};
