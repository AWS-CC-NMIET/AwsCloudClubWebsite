// ─────────────────────────────────────────────────────────────────────────────
// Service Worker — AWS Cloud Club NMIET
// Strategy:
//   • Static assets (JS, CSS, fonts, images) → Cache First
//   • API routes (/api/*) → Network First (fresh data priority)
//   • HTML pages → Network First with offline fallback
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_NAME = "cloudos-v1"
const STATIC_CACHE = "cloudos-static-v1"
const API_CACHE = "cloudos-api-v1"

const PRECACHE_URLS = [
  "/",
  "/favicon.png",
  "/logo-icon.png",
  "/manifest.json",
]

// ── Install: precache critical assets ────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

// ── Activate: clean old caches ────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== STATIC_CACHE && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ── Fetch: routing strategy ───────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return

  // API routes — Network First
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request, API_CACHE))
    return
  }

  // Static assets (Next.js chunks, images) — Cache First
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(png|jpg|jpeg|webp|avif|svg|ico|woff2?)$/)
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // HTML pages — Network First with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, CACHE_NAME))
    return
  }
})

// ── Strategy helpers ──────────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response("", { status: 503, statusText: "Offline" })
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    return cached ?? new Response(
      JSON.stringify({ error: "You are offline" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    )
  }
}
