export const millisecondsToSeconds = (millis: number): number => {
  const seconds = Math.floor(millis / 1000);
  return seconds;
};

export const subtractTwelveHoursMilliseconds = (input: number): number =>
  input - 12 * 60 * 60 * 1000;

export const currentTimestampMilliseconds = (
  currentTimestamp: Date = new Date()
): number => currentTimestamp.getTime();
