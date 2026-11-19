/*
 * Kanvas service worker.
 * Bump CACHE when changing the caching strategy so old entries are dropped.
 */
const CACHE = "kanvas-v3"
const PRECACHE = ["manifest.webmanifest", "favicon.svg", "icons/icon-192.png", "icons/icon-512.png"]

const scopeUrl = (path) => new URL(path, self.registration.scope).toString()

async function addAllSafe(cache, urls) {
  // One missing file should not abort the whole install and break offline mode.
  await Promise.allSettled(urls.map((url) => cache.add(url)))
}

async function precache() {
  const cache = await caches.open(CACHE)
  const indexUrl = scopeUrl("")
  const response = await fetch(indexUrl, { cache: "reload" })
  const html = await response.clone().text()

  await cache.put(indexUrl, response)

  const urls = new Set(PRECACHE.map(scopeUrl))

  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const raw = match[1]
    if (!raw || raw.startsWith("data:")) continue

    const url = new URL(raw, indexUrl)
    if (url.origin === self.location.origin) urls.add(url.toString())
  }

  const assets = [...urls]
  await addAllSafe(cache, assets)

  // The app fonts live in the built stylesheet, so walk the cached CSS and
  // cache those files too. Otherwise offline mode would fall back to system fonts.
  const fonts = new Set()

  for (const assetUrl of assets) {
    if (!assetUrl.endsWith(".css")) continue

    const cached = await cache.match(assetUrl, { ignoreVary: true })
    if (!cached) continue

    const css = await cached.text()

    for (const match of css.matchAll(/url\((?:"|')?([^"')]+)(?:"|')?\)/g)) {
      const raw = match[1]
      if (!raw || raw.startsWith("data:")) continue

      const url = new URL(raw, assetUrl)
      if (url.origin === self.location.origin && !urls.has(url.toString())) {
        fonts.add(url.toString())
      }
    }
  }

  await addAllSafe(cache, [...fonts])
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()))
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event

  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          void caches.open(CACHE).then((cache) => cache.put(scopeUrl(""), copy))
          return response
        })
        .catch(async () => {
          const cached = await caches.match(scopeUrl(""), { ignoreVary: true })
          return cached || Response.error()
        }),
    )
    return
  }

  event.respondWith(
    // ignoreVary matters: static hosts often send `Vary: Origin`, while the
    // precached request has no Origin header, so an exact match would miss.
    caches.match(request, { ignoreVary: true }).then((cached) => {
      if (cached) return cached

      return fetch(request).then((response) => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone()
          void caches.open(CACHE).then((cache) => cache.put(request, copy))
        }
        return response
      })
    }),
  )
})
