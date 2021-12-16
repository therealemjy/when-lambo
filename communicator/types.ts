import { GasFees } from '@localTypes';

export type Message = StopMonitoringSignalMessage | GasFeesUpdateMessage;

export type StopMonitoringSignalMessage = {
  type: 'stopMonitoringSignal';
};

export type GasFeesUpdateMessage = {
  type: 'gasFeesUpdate';
  data: GasFees;
};
