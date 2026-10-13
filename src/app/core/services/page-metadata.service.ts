import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { I18nService, TranslationKey } from './i18n.service';

const origin = 'https://natijati-mr.online';

@Injectable({ providedIn: 'root' })
export class PageMetadataService {
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly url = signal(this.router.url);

  constructor() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(event => this.url.set(event.urlAfterRedirects));
    effect(() => this.update(this.url()));
  }

  private update(url: string): void {
    const path = url.split(/[?#]/)[0];
    const parts = path.split('/').filter(Boolean);
    const keys: Record<string, TranslationKey> = {
      exams: 'archives.title', search: 'advanced.title', statistics: 'statistics.title',
      institutions: 'institutions.title', about: 'about.title', result: 'result.title'
    };
    const key = parts[0] === 'institutions' && parts[1] ? 'seo.institution' : keys[parts[0]] ?? 'seo.home';
    // Only allowlisted exam/year values enter metadata; never candidate identifiers or names.
    const resultContext = parts[0] === 'result' && /^(bac|bepc|c1as)$/i.test(parts[1] ?? '') && /^\d{4}$/.test(parts[2] ?? '')
      ? ` ${parts[1].toUpperCase()} ${parts[2]}` : '';
    const title = `${this.i18n.t(key)}${resultContext} — Natijati MR`;
    const description = this.i18n.t('seo.description');
    const privatePage = parts[0] === 'result' || parts[0] === 'search';
    const canonicalPath = privatePage ? '/' : parts[0] === 'institutions' ? '/institutions' : path || '/';
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: privatePage ? 'noindex, nofollow' : 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: origin + canonicalPath });
    let canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (privatePage) { canonical?.remove(); return; }
    if (!canonical) {
      canonical = this.document.createElement('link'); canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }
    canonical.href = origin + canonicalPath;
  }
}
