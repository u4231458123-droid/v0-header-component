// MyDispatch Service Worker v1.1.0
const CACHE_NAME = "mydispatch-v1"

// Minimale Assets zum Cachen - nur was wirklich existiert
const STATIC_ASSETS = ["/", "/offline.html", "/manifest.json"]

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch((err) => console.log("[SW] Cache failed:", err)),
  )
  // Sofort aktivieren ohne auf alte Tabs zu warten
  self.skipWaiting()
})

// Activate Event - alte Caches loeschen
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
    }),
  )
  // Sofort Kontrolle uebernehmen
  self.clients.claim()
})

// Fetch Event - Network First mit Cache Fallback
self.addEventListener("fetch", (event) => {
  // Nur GET Requests behandeln
  if (event.request.method !== "GET") return

  // Keine Cross-Origin Requests cachen
  if (!event.request.url.startsWith(self.location.origin)) return

  // Navigation: Network first, offline.html als Fallback
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("/offline.html")))
    return
  }

  // Andere Requests: Network first, Cache als Fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Erfolgreiche Responses cachen
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone)
          })
        }
        return response
      })
      .catch(() => caches.match(event.request)),
  )
})
