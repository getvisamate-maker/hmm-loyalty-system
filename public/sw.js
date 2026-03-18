const CACHE_NAME = "hmm-loyalty-cache-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Pass-through fetch for now, required by some browsers to recognize PWA
  event.respondWith(fetch(event.request).catch(() => new Response("Offline mapping missing")));
});
