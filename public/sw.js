self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Empty on purpose. Chrome needs a fetch listener for installability.
// Do not call event.respondWith() — that intercepts Next.js RSC requests
// and client-side navigation dies (taps on FIND/CREATE/You do nothing).
self.addEventListener("fetch", () => {});
