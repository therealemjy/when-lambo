import BigNumber from 'bignumber.js';

declare global {
  var isMonitoring: boolean;
  var lastMonitoringDateTime: number | null;
  var botExecutionMonitoringTick: number;

  var perfMonitoringRecords: number[];

  var currentGasPrices: {
    rapid: BigNumber;
    fast: BigNumber;
    standard: BigNumber;
    slow: BigNumber;
  };
}
