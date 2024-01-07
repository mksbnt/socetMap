export const millisecondsToSeconds = (millis: number): number => {
  return Math.floor(millis / 1000);
};

export const secondsToMilliseconds = (seconds: number): number =>
  seconds * 1000;

export const subtractTwelveHoursMilliseconds = (input: number): number =>
  input - 12 * 60 * 60 * 1000;

export const currentTimestampMilliseconds = (
  currentTimestamp: Date = new Date()
): number => currentTimestamp.getTime();
