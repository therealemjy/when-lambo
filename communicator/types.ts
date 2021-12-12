export type Message = StopMonitoringSignalMessage | GasFeesUpdateMessage;

export type StopMonitoringSignalMessage = {
  type: 'stopMonitoringSignal';
};

export type GasFees = {
  maxPriorityFeePerGas: number;
  maxFeePerGas: number;
};

export type GasFeesUpdateMessage = {
  type: 'gasFeesUpdate';
  data: GasFees;
};
