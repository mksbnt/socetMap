import {
  IGroupedSignals,
  INewGroupedSignal,
  ISignal,
} from '../interfaces/signal.interface';
import {
  currentTimestampMilliseconds,
  millisecondsToSeconds,
  secondsToMilliseconds,
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

export const groupSignalsByTimestamp = (
  signals: ISignal[]
): IGroupedSignals => {
  return signals.reduce<IGroupedSignals>((grouped, obj) => {
    const timestamp = obj.timestamp;
    grouped[timestamp] = grouped[timestamp] || [];
    grouped[timestamp].push(obj);
    return grouped;
  }, {});
};

export const getLastSignalTimestamp: (
  signals: INewGroupedSignal[]
) => number = (signals) => {
  return signals.at(-1)?.timestamp
    ? secondsToMilliseconds(signals.at(-1)!.timestamp)
    : currentTimestampMilliseconds();
};
