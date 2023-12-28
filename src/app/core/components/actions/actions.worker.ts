/// <reference lib="webworker" />

const iteration = 5;

addEventListener('message', ({ data }) => {
  let currentKey = Number(data.split(';')[0]);
  const lastKey = data.split(';')[1]; // remove variable

  setInterval(() => {
    currentKey = currentKey + iteration;
    postMessage(currentKey.toString());
  }, iteration);
});
