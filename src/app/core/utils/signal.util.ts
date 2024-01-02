import {
  IGroupedSignals,
  INewGroupedSignal,
  ISignal,
} from '../interfaces/signal.interface';
import {
  millisecondsToSeconds,
  subtractTwelveHoursMilliseconds,
} from './time.util';

export const oldSignalsIds = (
  signals: INewGroupedSignal[],
  currentTimestamp: number
): number[] => {
  return signals
    .filter(
      (signal) =>
        signal.timestamp < subtractTwelveHoursMilliseconds(currentTimestamp)
    )
    .map((signal) => signal.id as number)
    .filter((id) => id !== undefined);
};

export const extractTimestampAndSignals = (
  groupedSignals: IGroupedSignals
): [number, ISignal[]] => {
  const timeStamp = millisecondsToSeconds(
    Number(Object.keys(groupedSignals)[0])
  );
  const signals = Object.values(groupedSignals)[0].map((signal: ISignal) => ({
    ...signal,
    timestamp: millisecondsToSeconds(Number(signal.timestamp)),
    frequency: signal.frequency,
  }));
  return [timeStamp, signals];
};
