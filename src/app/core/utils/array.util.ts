export const makeArray = <T>(data: Array<T> | T) =>
  Array.isArray(data) ? data : [data];
