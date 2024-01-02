/// <reference lib="webworker" />

const ITERATION = 1000;

addEventListener('message', ({ data }) => {
  let current = data;

  setInterval(() => {
    current = current + ITERATION;
    postMessage(current);
  }, ITERATION);
});
