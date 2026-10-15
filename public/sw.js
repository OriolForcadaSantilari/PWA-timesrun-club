self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Empty fetch listener: satisfies older Chromium install checks without caching.
self.addEventListener("fetch", () => {});
