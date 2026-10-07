const CACHE = "forty-meters-v2";

const ASSETS = [
  "./",
  "./index.html",
  "./css/app.css",
  "./js/boot.js",
  "./js/game.js",
  "./js/words.js",
  "./js/onboard.js",
  "./assets/scene.svg",
  "./assets/icon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./manifest.json",
  "./sw.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(networkFirst(event.request));
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const copy = response.clone();
    const cache = await caches.open(CACHE);
    cache.put(request, copy).catch(() => {});
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const home = await caches.match("./index.html");
      if (home) return home;
    }
    throw new Error("offline");
  }
}
