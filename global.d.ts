import BigNumber from 'bignumber.js';

declare global {
  var isMonitoring: boolean;
  var lastMonitoringDateTime: number | null;
  var secrets:
    | {
        mnemonic: string;
      }
    | undefined;
  var botExecutionMonitoringTick: number;

  var perfMonitoringRecords: number[];

  var currentGasPrices: {
    rapid: BigNumber;
    fast: BigNumber;
    standard: BigNumber;
    slow: BigNumber;
  };
}
