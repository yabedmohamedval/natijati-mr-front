import { ApplicationRef, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate } from '@angular/service-worker';
import { catchError, exhaustMap, filter, from, fromEvent, merge, of, switchMap, take, throttleTime, timer } from 'rxjs';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-pwa-status',
  standalone: true,
  template: `
    @if (offline()) {
      <p role="status" class="m-0 bg-amber-50 px-5 py-3 text-center text-amber-950">{{ i18n.t('pwa.offline') }}</p>
    }
    @if (ready() || unrecoverable()) {
      <div role="status" class="flex flex-wrap items-center justify-center gap-3 bg-emerald-50 px-5 py-3 text-emerald-950">
        <span>{{ i18n.t(unrecoverable() ? 'pwa.unrecoverable' : 'pwa.ready') }}</span>
        <button type="button" class="rounded border border-current px-3 py-1 font-bold disabled:opacity-50"
          [disabled]="offline()" (click)="reload()">{{ i18n.t('pwa.reload') }}</button>
      </div>
    }
  `
})
export class PwaStatusComponent {
  readonly i18n = inject(I18nService);
  readonly offline = signal(!navigator.onLine);
  readonly ready = signal(false);
  readonly unrecoverable = signal(false);

  constructor() {
    merge(fromEvent(window, 'online'), fromEvent(window, 'offline'))
      .pipe(takeUntilDestroyed()).subscribe(() => this.offline.set(!navigator.onLine));

    const updates = inject(SwUpdate);
    if (!updates.isEnabled) return;
    updates.versionUpdates.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event.type === 'VERSION_READY') this.ready.set(true);
    });
    updates.unrecoverable.pipe(takeUntilDestroyed()).subscribe(() => this.unrecoverable.set(true));

    // Start polling only after stability, so SW registration is not delayed.
    inject(ApplicationRef).isStable.pipe(
      filter(Boolean), take(1),
      switchMap(() => merge(of(null), timer(30 * 60_000, 30 * 60_000),
        fromEvent(window, 'online'),
        fromEvent(document, 'visibilitychange').pipe(filter(() => document.visibilityState === 'visible')))),
      filter(() => navigator.onLine), throttleTime(60_000),
      exhaustMap(() => from(updates.checkForUpdate()).pipe(catchError(() => of(false)))),
      takeUntilDestroyed()
    ).subscribe();
  }

  reload(): void {
    // A full user-initiated reload switches versions without mixing old/new chunks.
    window.location.reload();
  }
}
