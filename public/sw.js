const SHELL_CACHE = 'nestlume-shell-v3';
const BIBLE_CACHE = 'nestlume-bible-v1';
const ORIGINAL_CACHE = 'nestlume-original-v1';
const CORE = ['/manifest.webmanifest', '/offline.html', '/corpus/blivre/2018.2.0/catalog.json'];

async function cacheAppShell() {
  const cache = await caches.open(SHELL_CACHE);
  const indexResponse = await fetch('/', { cache: 'no-store', credentials: 'same-origin' });
  if (!indexResponse.ok) throw new Error(`shell-index-http-${indexResponse.status}`);

  const html = await indexResponse.clone().text();
  await cache.put('/', indexResponse);

  const assetUrls = new Set(CORE);
  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    try {
      const url = new URL(match[1], self.location.origin);
      if (url.origin === self.location.origin && (url.pathname.startsWith('/assets/') || CORE.includes(url.pathname))) {
        assetUrls.add(url.pathname + url.search);
      }
    } catch {
      // Ignore malformed/non-URL attributes.
    }
  }

  await Promise.all([...assetUrls].map(async url => {
    const response = await fetch(url, { cache: 'no-store', credentials: 'same-origin' });
    if (!response.ok) throw new Error(`shell-asset-http-${response.status}:${url}`);
    await cache.put(url, response);
  }));
}

self.addEventListener('install', event => {
  event.waitUntil(cacheAppShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => ![SHELL_CACHE, BIBLE_CACHE, ORIGINAL_CACHE].includes(key)).map(key => caches.delete(key))))
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

async function sha256(bytes) {
  return hex(await crypto.subtle.digest('SHA-256', bytes));
}

async function cacheOriginalBook(bookCode, chapters) {
  if (!bookCode || !Number.isInteger(chapters) || chapters < 1) {
    return { ok: false, error: 'original-package-metadata-missing' };
  }

  const manifestResponse = await fetch('/original/step/manifest.json', { cache: 'no-store', credentials: 'same-origin' });
  if (!manifestResponse.ok) return { ok: false, error: `original-manifest-http-${manifestResponse.status}` };
  const manifest = await manifestResponse.json();
  const cache = await caches.open(ORIGINAL_CACHE);
  const added = [];

  try {
    for (let chapter = 1; chapter <= chapters; chapter += 1) {
      const relative = `${bookCode}/${chapter}.json`;
      const expected = manifest.packages?.[relative];
      if (!expected?.sha256) throw new Error(`missing-integrity:${relative}`);

      const url = `/original/step/chapters/${relative}`;
      const response = await fetch(url, { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) throw new Error(`http-${response.status}:${relative}`);

      const bytes = await response.clone().arrayBuffer();
      if (bytes.byteLength !== expected.bytes) throw new Error(`size-mismatch:${relative}`);
      if (await sha256(bytes) !== expected.sha256) throw new Error(`integrity-mismatch:${relative}`);

      await cache.put(url, response);
      added.push(url);
    }
    return { ok: true, chapters: added.length };
  } catch (error) {
    await Promise.all(added.map(url => cache.delete(url)));
    return { ok: false, error: String(error) };
  }
}

self.addEventListener('message', event => {
  const data = event.data || {};
  if (data.type === 'CACHE_BIBLE_BOOK') {
    event.waitUntil((async () => {
      try {
        await cacheAppShell();
        const response = await fetch(data.url, { cache: 'no-store', credentials: 'same-origin' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const bytes = await response.clone().arrayBuffer();
        if (data.expectedGitBlobSha1) {
          const actual = await gitBlobSha1(bytes);
          if (actual !== data.expectedGitBlobSha1) throw new Error('integrity-mismatch');
        }
        const cache = await caches.open(BIBLE_CACHE);
        await cache.put(data.url, response);
        const originals = await cacheOriginalBook(data.bookCode, data.chapters);
        event.source?.postMessage({
          type: 'CACHE_BIBLE_BOOK_RESULT',
          url: data.url,
          ok: true,
          originalLanguageOk: originals.ok,
          originalLanguageChapters: originals.chapters || 0,
          warning: originals.ok ? null : originals.error,
        });
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

  if (new URL(event.request.url).pathname.startsWith('/original/step/chapters/')) {
    event.respondWith(
      caches.open(ORIGINAL_CACHE)
        .then(cache => cache.match(event.request))
        .then(hit => hit || fetch(event.request))
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

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
    }).catch(async () => {
      if (event.request.destination === 'document') return (await caches.match('/')) || (await caches.match('/offline.html'));
      throw new Error('offline-resource-unavailable');
    }))
  );
});
