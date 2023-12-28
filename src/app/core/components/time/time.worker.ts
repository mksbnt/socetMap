/// <reference lib="webworker" />

addEventListener('message', () => {
  setInterval(() => {
    postMessage(new Date());
  }, 1000);
});
