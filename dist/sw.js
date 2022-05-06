CACHE_NAME = "mvhs-timer"
CACHE_VERSION = "V6"

self.addEventListener("install", function (event) {
  self.skipWaiting()
  event.waitUntil(async () => {
    if (self.registration.navigationPreload) {
      // Enable navigation preloads!
      await self.registration.navigationPreload.enable()
    }
    await caches.open(CACHE_NAME + CACHE_VERSION).then(function (cache) {
      return cache.addAll(["/mvhs-timer/", "/mvhs-timer/index.html"])
    })
  })
})

self.addEventListener("activate", () => {
  caches.keys().then(function (keyList) {
    console.log(keyList)
    keyList.forEach(key => caches.delete(key))
  })
})

self.addEventListener("fetch", function (event) {
  function getCachedResponse(url) {
    return caches.match(url).then(function (response) {
      if (response) {
        return response
      }
      return new Response("Service worker fetch error", {
        status: 500,
        statusText: "Service worker fetch error",
      })
    })
  }

  function getFromServer(url) {
    const response = fetch(url).then(response => {
      if (!response || response.status !== 200) {
        console.log(
          "loading from cache due to bad response from server " +
            event.request.url,
          response
        )
        return caches.match(url)
      }
      return response
    })
    return response
  }

  event.respondWith(
    (async () => {
      const url = event.request.url
      const cachedResponse = await getCachedResponse(url)
      if (cachedResponse && cachedResponse.status === 200) {
        return cachedResponse
      }
      const serverResponse = await getFromServer(url)
      const cache = await caches.open(CACHE_NAME + CACHE_VERSION)
      const clonedResponse = serverResponse.clone()
      cache.put(url, clonedResponse)
      return serverResponse
    })()
  )
})
