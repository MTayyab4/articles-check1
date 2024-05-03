//sw.js
const staticAssets = [
    "/",
    "/index.html",
    "/404.html",
    "/offline.html",
    "audio/article 1",
    "audio/article 2",
    "photos/Flag-of-Congo-01.svg",
    "photos/images.png"
  ];
  let cacheVersion = 0;
  let cacheName = `cache-v${cacheVersion}`;
  function increment() {
    cacheVersion++;
    cacheName = `cache-v${cacheVersion}`;
  }
  
  //Add cache while installing Sw
  self.addEventListener("install", (event) => {
    console.log("Attempting to install service worker and cache static assets");
    event.waitUntil(
      caches
        .open(cacheName)
        .then((cache) => {
          //Update version
          console.log("previous version", cacheVersion)
          increment();
          console.log("new version", cacheVersion)
          //add files to the cache
          console.log("adding cache" , cache.addAll(staticAssets))
  
          return cache.addAll(staticAssets);
        })
        .catch((err) => console.log(err))
    );
  });
  
  self.addEventListener("activate", (event) => {
    console.log("Activating new service worker...");
  
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        console.log("activating cacheName ", cacheName)
        return Promise.all(
          cacheNames.map((storedCacheName) => {
            if (storedCacheName !== cacheName) {
              console.log("Deleting old cache ", storedCacheName)
              return caches.delete(storedCacheName);
            }
          })
        );
      })
    );
  });
  
  self.addEventListener("fetch", (event) => {
    console.log("Fetch event for", event.request.url);
  
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => {
          //If the response is found in the cache
          console.log("fetch response", response);
          if (response) {
            console.log("Found ", event.request.url, " in cache");
            return response;
          }
  
          return fetch(event.request).then((response) => {
            // If a response is not found
            console.log("fetch if (404) response", response);
  
            if (response.status === 404) {
              return caches.open(cacheName).then((cache) => {
                console.log("fetch return (404) response", response);
  
                return cache.match("404.html");
              });
            }
  
            //Caching and returning the response if it doesn't exist in the cache
            return caches.open(cacheName).then((cache) => {
              console.log("fetch cache.put & Cloning",cache)
              cache.put(event.request.url, response.clone());
              return response;
            });
          });
        })
        .catch(async (error) => {
          console.log("Fetching Error, ", error);
          //If page is offline/ Network failure
          return caches.open(cacheName).then((cache) => {
            console.log("Page not found ", cache)
            return cache.match("offline.html");
          });
        })
    );
  });