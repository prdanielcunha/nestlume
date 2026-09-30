const SHELL_CACHE = 'nestlume-shell-v2';
const BIBLE_CACHE = 'nestlume-bible-v1';
const CORE = ['/', '/manifest.webmanifest', '/offline.html', '/corpus/blivre/2018.2.0/catalog.json'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => ![SHELL_CACHE, BIBLE_CACHE].includes(key)).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function isBibleBook(url) {
  return new URL(url).pathname.startsWith('/corpus/blivre/2018.2.0/tr/');
}

function hex(buffer) {
  return [...new Uint8Array(buffer)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function gitBlobSha1(bytes) {
  const header = new TextEncoder().encode(`blob ${bytes.byteLength}\0`);
  const joined = new Uint8Array(header.length + bytes.byteLength);
  joined.set(header, 0);
  joined.set(new Uint8Array(bytes), header.length);
  return hex(await crypto.subtle.digest('SHA-1', joined));
}

self.addEventListener('message', event => {
  const data = event.data || {};
  if (data.type === 'CACHE_BIBLE_BOOK') {
    event.waitUntil((async () => {
      try {
        const response = await fetch(data.url, { cache: 'no-store', credentials: 'same-origin' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const bytes = await response.clone().arrayBuffer();
        if (data.expectedGitBlobSha1) {
          const actual = await gitBlobSha1(bytes);
          if (actual !== data.expectedGitBlobSha1) throw new Error('integrity-mismatch');
        }
        const cache = await caches.open(BIBLE_CACHE);
        await cache.put(data.url, response);
        event.source?.postMessage({ type: 'CACHE_BIBLE_BOOK_RESULT', url: data.url, ok: true });
      } catch (error) {
        event.source?.postMessage({ type: 'CACHE_BIBLE_BOOK_RESULT', url: data.url, ok: false, error: String(error) });
      }
    })());
  }

  if (data.type === 'REMOVE_BIBLE_BOOK') {
    event.waitUntil(caches.open(BIBLE_CACHE).then(cache => cache.delete(data.url)));
  }
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  if (isBibleBook(event.request.url)) {
    event.respondWith(
      caches.open(BIBLE_CACHE)
        .then(cache => cache.match(event.request))
        .then(hit => hit || fetch(event.request))
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then(hit => hit || caches.match('/') || caches.match('/offline.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {
      const url = new URL(event.request.url);
      if (url.origin === self.location.origin && !url.pathname.endsWith('/search-index.json')) {
        const copy = response.clone();
        caches.open(SHELL_CACHE).then(cache => cache.put(event.request, copy));
      }
      return response;
    }))
  );
});
