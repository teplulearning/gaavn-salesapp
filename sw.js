var CACHE = 'gf-sales-v103';  // ← bump this number every time you deploy

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(['./']);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  // Always go to network for Google APIs
  if(url.includes('script.google.com') || url.includes('fonts.google')) {
    e.respondWith(fetch(e.request).catch(function() {
      return new Response('', {status: 503});
    }));
    return;
  }
  // Network first for the main HTML — so updates always come through
  if(url.includes('index.html') || url.endsWith('/gaavn-salesapp/') || url.endsWith('/gaavn-salesapp')) {
    e.respondWith(
      fetch(e.request, {cache: 'no-store'}).catch(function() {
        return caches.match(e.request);
      })
    );
    return;
  }
  // Cache first for everything else
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request);
    })
  );
});
