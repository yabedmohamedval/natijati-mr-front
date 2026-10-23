// Production UI smoke checks using Chrome DevTools Protocol and Node built-ins.
// No production API access: all external requests are intercepted with synthetic data.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const root = resolve('dist/national-exams-frontend/browser');
const artifacts = resolve('.angular/ui3-checks');
await mkdir(artifacts, { recursive: true });
const profile = await mkdtemp(`${tmpdir()}/natijati-ui-`);
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://localhost').pathname;
    // PWA behavior is covered separately; keep this visual run independent of SW cache.
    if (path.includes('worker') || path.includes('ngsw')) { res.writeHead(404); res.end(); return; }
    const file = resolve(root, `.${path}`);
    assert(file.startsWith(`${root}/`) || file === root);
    const target = extname(path) ? file : `${root}/index.html`;
    const body = await readFile(target);
    res.writeHead(200, { 'Content-Type': mime[extname(target)] ?? 'application/octet-stream' }); res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
const origin = `http://127.0.0.1:${server.address().port}`;
const chrome = spawn(process.env.CHROME_BIN ?? 'google-chrome', ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--remote-debugging-pipe', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] });
let sequence = 0, buffer = '', sessionId, mode = 'success';
const pending = new Map(), errors = [], results = [];
let apiRequests = 0;
const apiLog = [], stateResults = [], journeys = [];
let institutionContext = { examType: 'BAC', year: 2026 };
const call = (method, params = {}, session = sessionId) => new Promise((resolve, reject) => {
  const id = ++sequence;
  const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 15000);
  pending.set(id, { resolve, reject, timer });
  chrome.stdio[3].write(JSON.stringify({ id, method, params, ...(session ? { sessionId: session } : {}) }) + '\0');
});
chrome.on('error', error => { errors.push(error.message); });
chrome.stderr.on('data', data => { if (String(data).includes('FATAL')) process.stderr.write(data); });
const sample = { examType: 'BAC', year: 2026, sessionType: 'NORMAL', identifier: '001', nameFr: 'Candidat de démonstration au nom volontairement long', nameAr: 'مترشح تجريبي باسم طويل لاختبار عرض النتائج باللغة العربية', wilayaFr: 'Nouakchott', wilayaAr: 'نواكشوط', institutionFr: 'Établissement de démonstration au nom long', institutionAr: 'مؤسسة تجريبية ذات اسم طويل لاختبار العرض', score: 14.32, decisionCode: 'ADMITTED', decisionLabel: 'Admis', seriesFr: 'Mathématiques', seriesAr: 'الرياضيات', examCenterFr: 'Centre de démonstration', examCenterAr: 'مركز تجريبي' };
const distribution = [
  { code: 'A', labelFr: 'Libellé de démonstration volontairement long', labelAr: 'تسمية تجريبية طويلة للتحقق من توزيع النتائج', count: 600, percentage: 60 },
  { code: 'B', labelFr: 'Autre libellé de test', labelAr: 'تسمية تجريبية أخرى', count: 400, percentage: 40 }
];
const stats = { examType: 'BAC', year: 2026, sessionType: 'NORMAL', candidateCount: 1000, admittedCount: 786, failedCount: 194, secondSessionCount: 20, cancelledCount: 0, averageScore: 14.32, successRate: 78.6, byWilaya: distribution, bySeries: distribution };
const institution = { ...stats, id: 'demo', nameFr: 'Établissement de démonstration au nom particulièrement long pour vérifier la lisibilité des fiches et des cartes', nameAr: 'مؤسسة تعليمية تجريبية ذات اسم طويل جدا للتحقق من وضوح بطاقات المؤسسات وصفحات التفاصيل باللغة العربية', wilayaFr: 'Nouakchott', wilayaAr: 'نواكشوط' };
const page = (content, index = 0) => ({ content, page: index, size: 20, totalElements: content.length ? 25 : 0, totalPages: content.length ? 2 : 0 });
async function intercept(params) {
  const url = new URL(params.request.url);
  if (url.origin === origin) { await call('Fetch.continueRequest', { requestId: params.requestId }); return; }
  apiRequests++; apiLog.push(url);
  const examType = (url.searchParams.get('examType') ?? url.pathname.match(/\/(bac|bepc|c1as)\//i)?.[1] ?? 'BAC').toUpperCase();
  const sessionType = url.searchParams.get('sessionType') ?? 'NORMAL';
  const candidate = { ...sample, examType, sessionType, ...(examType === 'C1AS' ? { score: 180, decisionLabel: null, decisionCode: null, seriesFr: null, seriesAr: null } : {}) };
  let data = {}, code = mode === 'error' ? 500 : mode === 'not-found' ? 404 : 200;
  if (url.pathname.endsWith('/exams')) data = mode === 'empty' ? [] : mode === 'unavailable' ? [{examType:'BAC',available:false,sessions:[]}] : ['BAC', 'BEPC', 'C1AS'].map(examType => ({ examType, available: true, sessions: [{ id: 1, examType, year: 2026, sessionType: 'NORMAL', status: 'PUBLISHED', resultCount: 1234 }, { id: 2, examType, year: 2024, sessionType: 'COMPLEMENTARY', status: 'PUBLISHED', resultCount: 123 }] }));
  else if (url.pathname.endsWith('/search')) {
    const { seriesFr, seriesAr, examCenterFr, examCenterAr, ...searchItem } = candidate;
    data = page(mode === 'empty' ? [] : [searchItem], Number(url.searchParams.get('page') ?? 0));
  }
  else if (url.pathname.includes('/statistics/')) data = { ...stats, examType, sessionType, ...(mode === 'empty' ? { candidateCount: 0, admittedCount: 0, failedCount: 0, secondSessionCount: 0, averageScore: null, successRate: 0, byWilaya: [], bySeries: [] } : {}) };
  else if (url.pathname.endsWith('/institutions')) {
    institutionContext = { examType, year: Number(url.searchParams.get('year') ?? 2026) };
    data = page(mode === 'empty' ? [] : [0, 1, 2].map(index => ({...institution, ...institutionContext, sessionType, id: index ? `demo-${index}` : 'demo'})), Number(url.searchParams.get('page') ?? 0));
  }
  else if (url.pathname.includes('/institutions/')) data = { summary: {...institution, ...institutionContext, sessionType, ...(mode === 'empty' ? {averageScore:null} : {})}, decisionDistribution: mode === 'empty' ? [] : distribution, seriesDistribution: mode === 'empty' ? [] : distribution };
  else if (url.pathname.includes('/results/')) data = candidate;
  else code = 404;
  if (mode === 'loading') await new Promise(r => setTimeout(r, 1200));
  await call('Fetch.fulfillRequest', { requestId: params.requestId, responseCode: code, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }, { name: 'Access-Control-Allow-Origin', value: '*' }], body: Buffer.from(JSON.stringify(data)).toString('base64') });
}
chrome.stdio[4].on('data', data => {
  buffer += data.toString();
  for (let end; (end = buffer.indexOf('\0')) >= 0;) {
    const msg = JSON.parse(buffer.slice(0, end)); buffer = buffer.slice(end + 1);
    if (msg.id) {
      const item = pending.get(msg.id); if (!item) continue;
      clearTimeout(item.timer); pending.delete(msg.id);
      if (msg.error) item.reject(new Error(JSON.stringify(msg.error))); else item.resolve(msg.result);
    } else if (msg.method === 'Fetch.requestPaused') intercept(msg.params).catch(e => errors.push(e.message));
    else if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.text + ': ' + (msg.params.exceptionDetails.exception?.description ?? ''));
  }
});
const evaluate = async expression => {
  const response = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description ?? expression);
  return response.result.value;
};
const until = async expression => {
  for (let i = 0; i < 100; i++) { if (await evaluate(`Boolean(${expression})`)) return; await new Promise(r => setTimeout(r, 50)); }
  throw new Error(`UI timeout: ${expression}`);
};
const key = async (key, code = key) => {
  await call('Input.dispatchKeyEvent', { type: 'keyDown', key, code, ...(key === 'Enter' ? { text: '\r' } : {}), windowsVirtualKeyCode: key === 'Escape' ? 27 : key === 'Enter' ? 13 : key === 'Tab' ? 9 : 40 });
  await call('Input.dispatchKeyEvent', { type: 'keyUp', key, code });
};
const screenshot = async (name, viewportOnly = false) => {
  // Let the compositor settle after navigation/RTL changes before capturing its surface.
  // DOM geometry alone can be current while Chrome still paints the previous viewport.
  if (!viewportOnly) await evaluate('window.scrollTo({top:0,left:0,behavior:"instant"})');
  await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  await new Promise(resolve => setTimeout(resolve, 150));
  const width = await evaluate('innerWidth');
  const { cssContentSize } = await call('Page.getLayoutMetrics');
  // Avoid Chrome's RTL horizontal offset when a full-page clip already fits the viewport.
  const fitsViewport = viewportOnly || cssContentSize.height <= await evaluate('innerHeight');
  const { data } = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !fitsViewport, ...(fitsViewport ? {} : { clip: { x: 0, y: 0, width, height: cssContentSize.height, scale: 1 } }) });
  await writeFile(`${artifacts}/${name}.png`, Buffer.from(data, 'base64'));
};
try {
  const target = await call('Target.createTarget', { url: 'about:blank' }, null);
  sessionId = (await call('Target.attachToTarget', { targetId: target.targetId, flatten: true }, null)).sessionId;
  await call('Page.enable'); await call('Runtime.enable');
  await call('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  for (const lang of ['fr', 'ar']) {
    const { identifier } = await call('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('natijati-language', '${lang}');` });
    for (const width of [320, 375, 390, 768, 1024, 1440]) {
      await call('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      for (const route of ['/', '/search?examType=BAC', '/search?examType=BEPC', '/search?examType=C1AS', '/statistics', '/result/bac/2026/001', '/result/bepc/2026/001', '/result/c1as/2026/001', '/exams', '/institutions', '/institutions/demo', '/about']) {
        await call('Page.navigate', { url: origin + route });
        await until(`document.querySelector('main h1') && document.documentElement.lang === '${lang}' && !document.querySelector('mat-spinner')`);
        await evaluate('document.fonts.ready');
        const layout = await evaluate(`(() => {
          const visible = e => e.getBoundingClientRect().width > 0 && getComputedStyle(e).visibility !== 'hidden';
          const overflow = [...document.querySelectorAll('body *')].filter(e => visible(e) && !e.closest('.hero-orb') && !e.classList.contains('sr-only') && !e.classList.contains('skip-link')).filter(e => { const r=e.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1; }).map(e => e.tagName + '.' + e.className).slice(0, 10);
          return { width: innerWidth, scroll: document.documentElement.scrollWidth, overflow, h1: document.querySelectorAll('h1').length, footer: document.querySelectorAll('footer').length, dir: document.documentElement.dir, font: getComputedStyle(document.querySelector('mat-select') ?? document.body).fontFamily };
        })()`);
        assert.equal(layout.dir, lang === 'ar' ? 'rtl' : 'ltr');
        assert.equal(layout.h1, 1, `${route} has exactly one h1`);
        assert.equal(layout.footer, 1);
        assert(layout.scroll <= width + 1 && !layout.overflow.length, `${lang} ${width} ${route}: ${JSON.stringify(layout)}`);
        assert(layout.font.includes(lang === 'ar' ? 'Tajawal' : 'Inter'), JSON.stringify(layout));
        assert(await evaluate(`Array.from(document.querySelectorAll('.exam-option.selected')).every(button => {
          const icon = button.querySelector('.exam-icon').getBoundingClientRect();
          const mark = button.querySelector('.selection-mark').getBoundingClientRect();
          return icon.right <= mark.left || mark.right <= icon.left || icon.bottom <= mark.top || mark.bottom <= icon.top;
        })`), 'Selection check must not overlap the exam icon, including RTL');
        assert.equal(await evaluate(`document.querySelectorAll('app-header').length`), 1);
        assert(await evaluate(`Array.from(document.querySelectorAll('.session-link, .institution-card')).every(e => e.getBoundingClientRect().height >= 44)`), 'UI-3 touch targets');
        assert(await evaluate(`Array.from(document.querySelectorAll('.institution-card-top')).every(e => {
          const a=e.firstElementChild.getBoundingClientRect(), b=e.lastElementChild.getBoundingClientRect();
          return a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top;
        })`), 'Institution icon and context badge do not overlap');
        if (route.startsWith('/search') || route.startsWith('/result/')) {
          assert(await evaluate(`document.querySelector('meta[name=robots]').content.includes('noindex')`));
          assert(!await evaluate(`Array.from(document.querySelectorAll('title, meta[name=description], meta[property^="og:"]')).some(e => /Candidat de démonstration|مترشح تجريبي/.test(e.content || e.textContent))`));
        }
        assert(await evaluate(`Array.from(document.querySelectorAll('main .mat-icon-rtl-mirror')).filter(e => e.getBoundingClientRect().width > 0).every(e => {
          const transform = getComputedStyle(e).transform;
          return document.documentElement.dir === 'rtl' ? transform.startsWith('matrix(-1,') : transform === 'none';
        })`), 'Directional arrows mirror with RTL');
        results.push({ lang, width, route, status: 'pass' });
        if (route.includes('C1AS') || route.includes('/c1as/')) {
          assert(!await evaluate(`document.querySelector('.result-score, .score-box').textContent.includes('/ 20')`));
          assert.equal(await evaluate(`document.querySelectorAll('.decision-box, .result-decision').length`), 0);
        }
        if ([390, 1440].includes(width)) {
          const name = route === '/' ? 'home' : route.startsWith('/search') ? `search-${new URL(origin + route).searchParams.get('examType')}` : route.startsWith('/result/') ? `result-${route.split('/')[2]}` : route === '/statistics' ? 'statistics' : route === '/institutions/demo' ? 'institution-detail' : route.slice(1);
          if (name) await screenshot(`${name}-${lang}-${width}`);
        }
      }
      for (const [route, states] of [
        ['/exams', ['empty', 'error', 'loading', 'unavailable']],
        ['/institutions', ['empty', 'error', 'loading']],
        ['/institutions/demo', ['empty', 'error', 'loading', 'not-found']]
      ]) {
        for (const state of states) {
          mode = state;
          await call('Page.navigate', { url: origin + route });
          const selector = state === 'loading' ? 'mat-spinner' : state === 'unavailable' ? '.session-empty' : state === 'empty' && route.includes('/demo') ? '.distribution-empty' : `app-ui-state [role=${['error','not-found'].includes(state) ? 'alert' : 'status'}]`;
          await until(`document.querySelector('${selector}')`);
          await evaluate('document.fonts.ready');
          const stateLayout = await evaluate(`({h1:document.querySelectorAll('h1').length,footer:document.querySelectorAll('footer').length,dir:document.documentElement.dir,overflow:document.documentElement.scrollWidth > innerWidth})`);
          assert.deepEqual(stateLayout, {h1:1,footer:1,dir:lang==='ar'?'rtl':'ltr',overflow:false}, `${route} ${state} ${lang} ${width}`);
          if (state === 'empty' && route.includes('/demo')) {
            assert.equal(await evaluate(`document.querySelectorAll('.distribution-empty').length`), 2);
            assert.equal(await evaluate(`document.querySelectorAll('.stat-card strong')[2].textContent.trim()`), '—');
          }
          if (state === 'empty' && route === '/institutions') assert.equal(await evaluate(`document.querySelectorAll('.institution-card').length`), 0);
          if (state === 'unavailable') assert.equal(await evaluate(`document.querySelectorAll('.session-link').length`), 0);
          if ([390,1440].includes(width)) await screenshot(`state-${route === '/institutions/demo' ? 'institution-detail' : route.slice(1)}-${lang}-${width}-${state}`);
          if (state === 'loading') await until(`!document.querySelector('mat-spinner')`);
          stateResults.push({lang,width,route,state,status:'pass'});
        }
      }
      mode = 'success';
      // Shared navigation: keyboard open/close and focus restoration on every viewport.
      if (width < 1200) {
        await evaluate(`document.querySelector('.mobile-menu-button').focus()`); await key('Enter');
        await until(`document.querySelector('[role="menu"]')`);
        await until(`document.activeElement.getAttribute('role') === 'menuitem'`);
        assert.equal(await evaluate(`getComputedStyle(document.querySelector('.cdk-overlay-pane')).direction`), lang === 'ar' ? 'rtl' : 'ltr');
        assert.equal(await evaluate(`document.querySelectorAll('[role="menuitem"]').length`), 6);
        if (width === 390) await screenshot(`menu-${lang}`, true);
        await key('Escape'); await until(`!document.querySelector('[role="menu"]')`);
        await until(`document.activeElement === document.querySelector('.mobile-menu-button')`);
      } else assert.equal(await evaluate(`document.querySelectorAll('nav [aria-current="page"]').length`), 1);
      console.log(`PASS viewport: ${lang} ${width}px`);
    }
    // Empty/error/loading feedback and select overlays in each direction.
    await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 1000, deviceScaleFactor: 1, mobile: false });
    mode = 'success';
    await call('Page.navigate', {url: origin + '/exams'});
    await until(`document.querySelectorAll('.session-link').length === 6`);
    await evaluate(`document.querySelectorAll('.session-link')[4].focus()`);
    await key('Tab'); // Reach the last session through a real keyboard move, without leaving the page.
    assert(await evaluate(`document.activeElement.matches('.session-link') && getComputedStyle(document.activeElement).outlineStyle !== 'none'`), 'Archive keyboard focus is visible');
    await key('Enter');
    await until(`location.pathname === '/search' && document.querySelector('.result-row')`);
    assert.equal(await evaluate(`new URLSearchParams(location.search).get('examType')`), 'C1AS');
    assert.equal(await evaluate(`new URLSearchParams(location.search).get('year')`), '2024');
    assert.equal(await evaluate(`new URLSearchParams(location.search).get('sessionType')`), 'COMPLEMENTARY');
    journeys.push({lang,journey:'archive-keyboard-search',status:'pass'});

    await call('Page.navigate', {url: origin + '/institutions?examType=BEPC&year=2024&sessionType=COMPLEMENTARY'});
    await until(`document.querySelectorAll('.institution-card').length === 3`);
    assert.equal(await evaluate(`document.querySelector('.result-count').textContent.trim()`), '25');
    await evaluate(`document.querySelector('.name-filter input').value = 'test'; document.querySelector('.name-filter input').dispatchEvent(new Event('input',{bubbles:true})); document.querySelector('button[type=submit]').click()`);
    await until(`document.querySelectorAll('.institution-card').length === 3`);
    assert.equal(apiLog.at(-1).searchParams.get('query'), 'test');
    assert.equal(apiLog.at(-1).searchParams.get('examType'), 'BEPC');
    assert.equal(apiLog.at(-1).searchParams.get('year'), '2024');
    assert.equal(apiLog.at(-1).searchParams.get('sessionType'), 'COMPLEMENTARY');
    await evaluate(`document.querySelector('.mat-mdc-paginator-navigation-next').focus()`); await key('Enter');
    await until(`document.querySelector('.mat-mdc-paginator-range-label')?.textContent.includes('21')`);
    assert.equal(apiLog.at(-1).searchParams.get('page'), '1');
    assert.equal(apiLog.at(-1).searchParams.get('query'), 'test');
    // Material paginator labels/overlay inherit the active language and direction.
    assert(await evaluate(`document.querySelector('.mat-mdc-paginator-navigation-next').getAttribute('aria-label').length > 0`));
    await evaluate(`document.querySelector('mat-paginator mat-select').click()`);
    await until(`document.querySelector('[role=listbox]')`);
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.cdk-overlay-pane')).direction`), lang==='ar'?'rtl':'ltr');
    await key('Escape');
    await evaluate(`document.querySelector('.institution-card').focus()`); await key('Enter');
    await until(`location.pathname === '/institutions/demo' && document.querySelector('.institution-identity')`);
    assert(await evaluate(`document.querySelector('.identity-context').textContent.includes('BEPC 2024')`));
    const back = await evaluate(`document.querySelector('main a').getAttribute('href')`);
    assert.equal(back, '/institutions?examType=BEPC&year=2024&sessionType=COMPLEMENTARY');
    await evaluate(`document.querySelector('main a').focus()`); await key('Enter');
    await until(`location.pathname === '/institutions' && document.querySelector('.institution-card')`);
    assert.equal(await evaluate(`document.querySelector('mat-select[formcontrolname=examType]').textContent.trim()`), 'BEPC');
    journeys.push({lang,journey:'institution-filter-pagination-detail-return',status:'pass'});
    for (const route of ['/institutions?sessionType=INVALID','/institutions/demo?sessionType=INVALID']) {
      const before = apiRequests;
      await call('Page.navigate',{url:origin+route});
      await until(`document.querySelector('mat-error, app-ui-state [role=alert]')`);
      assert.equal(apiRequests,before,'Invalid institution session must not issue requests');
      journeys.push({lang,journey:route,status:'pass'});
    }
    // Keyboard choice uses native buttons and preserves the existing home dossier route.
    await call('Page.navigate', { url: origin + '/' });
    await until(`document.querySelector('#exams [data-exam=C1AS]') && document.querySelector('mat-select').textContent.includes('2026')`);
    await evaluate(`document.querySelector('#exams [data-exam=C1AS]').focus()`); await key('Enter');
    await until(`document.querySelector('#exams [data-exam=C1AS]').getAttribute('aria-pressed') === 'true'`);
    await evaluate(`const input = document.querySelector('#candidate-number'); input.value='001'; input.dispatchEvent(new Event('input', {bubbles:true}));`);
    await until(`!document.querySelector('button[type=submit]').disabled`);
    await evaluate(`document.querySelector('button[type=submit]').click()`);
    await until(`location.pathname === '/result/c1as/2026/001' && document.querySelector('.score-box')`);
    assert.equal(await evaluate(`document.querySelector('meta[name=robots]').content.includes('noindex')`), true);
    assert(!await evaluate(`document.title.includes('Candidat de démonstration') || document.title.includes('مترشح تجريبي')`));
    for (const route of ['/', '/search?examType=BAC', '/statistics', '/result/bac/2026/001']) {
      for (const state of (route.startsWith('/result') ? ['not-found', 'error', 'loading'] : route === '/' ? ['empty', 'error'] : ['empty', 'error', 'loading'])) {
        mode = state;
        await call('Page.navigate', { url: origin + route });
        await until(route === '/' ? `document.querySelector('.catalog-status .unavailable')` : state === 'loading' ? `document.querySelector('app-ui-state mat-spinner')` : `document.querySelector('app-ui-state [role="${state === 'error' ? 'alert' : 'status'}"]')`);
        await evaluate('document.fonts.ready');
        await screenshot(`state-${route === '/' ? 'home' : route.split(/[/?]/)[1]}-${lang}-${state}`);
        if (state === 'loading') await until(`!document.querySelector('mat-spinner')`);
      }
    }
    for (const route of ['/search?sessionType=INVALID', '/result/bac/2026/001?sessionType=INVALID']) {
      const before = apiRequests;
      await call('Page.navigate', { url: origin + route });
      await until(`document.querySelector('app-ui-state [role=alert]')`);
      assert.equal(apiRequests, before, 'Invalid sessions must not issue API requests');
      await screenshot(`invalid-${route.split(/[/?]/)[1]}-${lang}`);
    }
    mode = 'success';
    await call('Page.navigate', { url: origin + '/search?examType=BAC' });
    await until(`document.querySelector('.result-row')`);
    mode = 'success';
    await evaluate(`document.querySelector('mat-select').click()`);
    await until(`document.querySelector('[role="listbox"]')`);
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.cdk-overlay-pane')).direction`), lang === 'ar' ? 'rtl' : 'ltr');
    await key('Escape');
    await evaluate(`Object.defineProperty(navigator, 'onLine', { configurable: true, value: false }); window.dispatchEvent(new Event('offline'));`);
    await until(`document.querySelector('app-pwa-status [role="status"]')`);
    await screenshot(`offline-${lang}`);
    await evaluate(`Object.defineProperty(navigator, 'onLine', { configurable: true, value: true }); window.dispatchEvent(new Event('online'));`);
    await evaluate(`document.querySelector('.skip-link').click()`);
    assert(await evaluate(`document.activeElement.id === 'main-content'`));
    // Language button updates a live page, not only initial stored language.
    await evaluate(`document.querySelector('.language-button').click()`);
    await until(`document.documentElement.lang === '${lang === 'fr' ? 'ar' : 'fr'}'`);
    await call('Page.removeScriptToEvaluateOnNewDocument', { identifier });
  }
  assert.deepEqual(errors, [], 'No uncaught browser errors');
  await writeFile(`${artifacts}/results.json`, JSON.stringify(results, null, 2));
  await writeFile(`${artifacts}/ui3-states.json`, JSON.stringify(stateResults, null, 2));
  await writeFile(`${artifacts}/ui3-journeys.json`, JSON.stringify(journeys, null, 2));
  console.log(`PASS: ${results.length} page/viewport/language combinations + ${stateResults.length} UI-3 state combinations + ${journeys.length} UI-3 journeys; keyboard menu, RTL overlays, states, skip link and live language switch. Screenshots: ${artifacts}`);
} catch (error) {
  console.error('Current page:', await evaluate('location.href'));
  console.error('Focus:', await evaluate("document.activeElement.tagName + '.' + document.activeElement.className"));
  await screenshot('failure');
  throw error;
} finally {
  chrome.kill(); server.close();
  for (const item of pending.values()) clearTimeout(item.timer);
  await new Promise(r => chrome.once('close', r));
  await rm(profile, { recursive: true, force: true });
}
