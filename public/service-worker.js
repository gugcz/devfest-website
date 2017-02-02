self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting())
});

self.addEventListener('activate', function (event) {
  // `claim()` sets this worker as the active worker for all clients that
  // match the workers scope and triggers an `oncontrollerchange` event for
  // the clients.
  return self.clients.claim();
});