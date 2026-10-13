import '@angular/compiler';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ApplicationRef, createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject, Subject } from 'rxjs';
import { PwaStatusComponent } from '../src/app/shared/components/pwa-status/pwa-status.component';
import { I18nService } from '../src/app/core/services/i18n.service';

test('ready/update errors never auto reload; offline status and manual reload work', async t => {
  const windowMock = Object.assign(new EventTarget(), { location: { reload: () => reloads++ } });
  const documentMock = Object.assign(new EventTarget(), { visibilityState: 'visible' });
  let online = true, reloads = 0, checks = 0;
  for (const [key, value] of Object.entries({ window: windowMock, document: documentMock, navigator: { get onLine() { return online; } } })) {
    const old = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    t.after(() => { if(old) Object.defineProperty(globalThis,key,old); else delete (globalThis as any)[key]; });
  }
  const events = new Subject<any>(), errors = new Subject<any>(), stable = new BehaviorSubject(false);
  const injector = createEnvironmentInjector([
    { provide: I18nService, useValue: {} },
    { provide: ApplicationRef, useValue: { isStable: stable } },
    { provide: SwUpdate, useValue: { isEnabled: true, versionUpdates: events, unrecoverable: errors,
      checkForUpdate: async () => { checks++; throw new Error('offline'); } } }
  ], null as any);
  t.after(() => injector.destroy());
  const component = runInInjectionContext(injector, () => new PwaStatusComponent());
  assert.equal(checks, 0); stable.next(true); await new Promise(r=>setTimeout(r,0)); assert.equal(checks, 1);
  events.next({ type: 'VERSION_DETECTED' }); assert.equal(component.ready(), false);
  events.next({ type: 'VERSION_READY' }); assert.equal(component.ready(), true); assert.equal(reloads, 0);
  errors.next({ reason: 'missing chunk' }); assert.equal(component.unrecoverable(), true); assert.equal(reloads, 0);
  online = false; windowMock.dispatchEvent(new Event('offline')); assert.equal(component.offline(), true);
  online = true; windowMock.dispatchEvent(new Event('online')); assert.equal(component.offline(), false);
  component.reload(); assert.equal(reloads, 1);
});
