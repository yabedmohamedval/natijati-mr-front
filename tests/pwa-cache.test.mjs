import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { minimatch } from 'minimatch';
const root = new URL('../', import.meta.url);
const json = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const config = await json('ngsw-config.json');
const manifest = await json('dist/national-exams-frontend/browser/ngsw.json');
const worker = await readFile(new URL('public/natijati-worker.js', root), 'utf8');
const sensitive = ['/api/public/results/bac/2026/123?sessionType=NORMAL', '/api/public/results/bepc/2026/123', '/api/public/results/c1as/2026/dossier/456', '/api/public/catalog/search?name=TEST', '/api/public/catalog/search?candidateNumber=123'];

test('config and generated manifest never cache API data', () => {
  assert.deepEqual(config.dataGroups, []);
  assert.deepEqual(manifest.dataGroups, []);
  for (const path of sensitive) for (const url of [path, 'https://example.a.run.app'+path]) {
    for (const group of [...manifest.assetGroups, ...manifest.dataGroups]) {
      assert(!group.urls?.includes(url));
      assert(!group.patterns?.some(pattern => new RegExp(pattern).test(url)), url);
    }
  }
});

test('static shell, versioned bundles and icons remain cached, worker excluded', () => {
  const app = manifest.assetGroups.find(g => g.name === 'app');
  const assets = manifest.assetGroups.find(g => g.name === 'assets');
  assert.equal(app.installMode, 'prefetch');
  assert(app.urls.includes('/index.html'));
  assert(app.urls.includes('/manifest.webmanifest'));
  assert(app.urls.some(x => /\/main-.*\.js$/.test(x)));
  assert(app.urls.some(x => /\/styles-.*\.css$/.test(x)));
  assert(assets.urls.includes('/icons/icon-192.png'));
  assert(!app.urls.includes('/natijati-worker.js'));
});

function harness(failNetwork = false) {
  const listeners = {}, calls = [], deleted = [];
  const names = ['ngsw:/:1:data:published-results:cache','ngsw:/:db:1:data:published-results:age','ngsw:/:db:1:data:published-results:lru',
    'ngsw:/:hash:app:cache','ngsw:/:db:control','ngsw:/other/:1:data:published-results:cache','another-app'];
  vm.runInNewContext(worker, {
    URL,
    self: { registration: { scope: 'https://example.test/' }, addEventListener: (name, fn) => listeners[name] = fn },
    caches: { keys: async () => names, delete: async name => { deleted.push(name); return true; } },
    fetch: (req, options) => { calls.push({ req, options }); return failNetwork ? Promise.reject(new Error('offline')) : Promise.resolve('NETWORK'); },
    importScripts: url => { assert(listeners.fetch && listeners.activate); assert.equal(url, './ngsw-worker.js'); }
  });
  return { listeners, calls, deleted };
}

test('worker bypasses legacy Angular caching for same-origin and Cloud Run personal endpoints', async () => {
  const h = harness();
  for (const path of sensitive) for (const origin of ['https://example.test', 'https://example.a.run.app']) {
    let stopped = false, response;
    h.listeners.fetch({ request: { url: origin+path }, stopImmediatePropagation: () => stopped = true, respondWith: p => response = p });
    assert(stopped); assert.equal(await response, 'NETWORK');
    assert.equal(h.calls.at(-1).options.cache, 'no-store');
  }
  h.listeners.fetch({ request: { url: 'https://example.test/main-HASH.js' }, stopImmediatePropagation: () => assert.fail(), respondWith: () => assert.fail() });
});

test('offline personal request fails without a cache fallback', async () => {
  const h = harness(true); let response;
  h.listeners.fetch({ request: { url: 'https://example.a.run.app'+sensitive[0] }, stopImmediatePropagation() {}, respondWith: p => response = p });
  await assert.rejects(response, /offline/);
});

test('activation removes only this application’s retired personal caches and metadata', async () => {
  const h = harness(); let done;
  h.listeners.activate({ waitUntil: p => done = p }); await done;
  assert.deepEqual(h.deleted, ['ngsw:/:1:data:published-results:cache','ngsw:/:db:1:data:published-results:age','ngsw:/:db:1:data:published-results:lru']);
});

test('Hosting rules revalidate worker/manifests and retain immutable hashed assets', async () => {
  const { hosting } = await json('firebase.json');
  const policies = path => hosting.headers.filter(rule => minimatch(path, rule.source)).flatMap(rule => rule.headers.filter(h => h.key === 'Cache-Control').map(h => h.value));
  for (const file of ['natijati-worker.js','ngsw-worker.js','ngsw.json','manifest.webmanifest']) {
    const values = policies('/'+file); assert(values.some(v => v.includes('no-store'))); assert(!values.some(v => v.includes('immutable')));
  }
  assert(policies('/main-ABCDEFGH.js').some(v => v.includes('immutable')));
  assert(policies('/media/inter-latin-wght-normal-ABCDEFGH.woff2').some(v => v.includes('immutable')));
  assert(policies('/icons/icon-192.png').includes('public, max-age=86400'));
});

test('local fonts are cached on demand and no Google Fonts link remains', async () => {
  const index = await readFile(new URL('dist/national-exams-frontend/browser/index.html', root), 'utf8');
  assert(!/fonts\.(googleapis|gstatic)\.com/.test(index));
  const assets = manifest.assetGroups.find(g => g.name === 'assets');
  assert.equal(assets.installMode, 'lazy');
  const fonts = assets.urls.filter(url => url.endsWith('.woff2'));
  assert(fonts.some(url => url.includes('inter-latin')));
  assert(fonts.some(url => url.includes('tajawal-arabic')));
  assert(fonts.some(url => url.includes('material-symbols')));
  for (const url of fonts) assert(manifest.hashTable[url]);
});

test('declared PWA and Apple icon sizes match the PNG headers', async () => {
  const webmanifest = await json('public/manifest.webmanifest');
  const icons = [...webmanifest.icons, { src: '/icons/apple-touch-icon.png', sizes: '180x180' }];
  for (const icon of icons) {
    const bytes = await readFile(new URL('public'+icon.src, root));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
    assert.equal(`${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`, icon.sizes);
  }
});

test('sensitive routes carry HTTP noindex and never enter the sitemap', async () => {
  const { hosting } = await json('firebase.json');
  for (const path of ['/result/bac/2026/10001', '/result/c1as/2026/30001', '/search', '/search/']) {
    assert(hosting.headers.some(rule => minimatch(path, rule.source) && rule.headers.some(h => h.key === 'X-Robots-Tag' && h.value.includes('noindex'))), path);
  }
  assert(!hosting.headers.some(rule => minimatch('/about', rule.source) && rule.headers.some(h => h.key === 'X-Robots-Tag')));
  const sitemap = await readFile(new URL('public/sitemap.xml', root), 'utf8');
  assert(!/\/result|\/search|\?/.test(sitemap.replace('<?xml version="1.0" encoding="UTF-8"?>', '')));
  assert(sitemap.includes('https://natijati-mr.online/about'));
});
