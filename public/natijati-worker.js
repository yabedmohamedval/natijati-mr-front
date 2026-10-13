// Register before Angular's handler so even tabs using an old manifest cannot
// read or refill the retired personal-data cache once this worker is active.
self.addEventListener('fetch', event => {
  const path = new URL(event.request.url).pathname;
  if (/^\/api\/public\/(?:results(?:\/|$)|catalog\/search(?:\/|$))/.test(path)) {
    event.stopImmediatePropagation();
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
  }
});

self.addEventListener('activate', event => {
  const prefix = `ngsw:${new URL(self.registration.scope).pathname}:`;
  event.waitUntil(caches.keys().then(names => Promise.all(
    names.filter(name => name.startsWith(prefix) &&
      /^(?:db:)?\d+:data:published-results:(?:cache|age|lru)$/.test(name.slice(prefix.length))
    ).map(name => caches.delete(name))
  )));
});

// Angular retains responsibility for static assets, versions and offline shell.
importScripts('./ngsw-worker.js');
