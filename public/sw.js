// ─────────────────────────────────────────────────────────────────────────────
// Service Worker — AWS Student Builder Group NMIET
//
// Strategy:
//   • Hashed build assets (/_next/static/*)  → Cache First (they never change)
//   • Other static files (images, fonts)     → Stale-While-Revalidate
//   • API routes (/api/*)                    → Network First, cached fallback
//   • HTML pages                             → Network First, cached fallback
//
// Bump VERSION on every release that changes caching behaviour. Activating a
// new version deletes every cache from older versions, so visitors never get
// stuck on an old copy of the site.
// ─────────────────────────────────────────────────────────────────────────────

const VERSION = "v4-2026-10-11"
const PAGE_CACHE = `cloudos-pages-${VERSION}`
const STATIC_CACHE = `cloudos-static-${VERSION}`
const API_CACHE = `cloudos-api-${VERSION}`
const CURRENT_CACHES = [PAGE_CACHE, STATIC_CACHE, API_CACHE]

const PRECACHE_URLS = ["/", "/favicon.png", "/logo-icon.png", "/manifest.json"]

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(PAGE_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(k => !CURRENT_CACHES.includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", event => {
  const { request } = event
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Never cache during local development
  if (self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1") return

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request, API_CACHE))
    return
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Audio uses range requests (206) which the Cache API can't store — let the network handle it.
  if (/\.(png|jpe?g|webp|avif|svg|ico|gif|woff2?)$/.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE, event))
    return
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, PAGE_CACHE))
  }
})

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.status === 200) (await caches.open(cacheName)).put(request, response.clone()).catch(() => {})
    return response
  } catch {
    return new Response("", { status: 503, statusText: "Offline" })
  }
}

async function staleWhileRevalidate(request, cacheName, event) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const refresh = fetch(request)
    .then(response => {
      if (response.status === 200) cache.put(request, response.clone()).catch(() => {})
      return response
    })
    .catch(() => null)
  if (cached) {
    event.waitUntil(refresh)
    return cached
  }
  return (await refresh) ?? new Response("", { status: 503, statusText: "Offline" })
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.status === 200) (await caches.open(cacheName)).put(request, response.clone()).catch(() => {})
    return response
  } catch {
    const cached = (await caches.match(request)) ?? (request.mode === "navigate" ? await caches.match("/") : undefined)
    return (
      cached ??
      new Response(JSON.stringify({ error: "You are offline" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      })
    )
  }
}
