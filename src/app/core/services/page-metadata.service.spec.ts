import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { PageMetadataService } from './page-metadata.service';
import { I18nService } from './i18n.service';
import { LocalizedPaginator } from './localized-paginator.service';

describe('Accessible localized metadata and pagination', () => {
  let events: Subject<NavigationEnd>;
  beforeEach(() => {
    events = new Subject();
    TestBed.configureTestingModule({ providers: [LocalizedPaginator,
      { provide: Router, useValue: { url: '/', events } }
    ] });
    TestBed.inject(I18nService).setLanguage('fr');
    TestBed.inject(PageMetadataService); TestBed.tick();
  });
  function navigate(url: string) { events.next(new NavigationEnd(1, url, url)); TestBed.tick(); }
  it('excludes candidate identifiers and queries from result metadata', () => {
    navigate('/result/bac/2026/SECRET_IDENTIFIER?name=PRIVATE_NAME');
    expect(document.title).toContain('BAC 2026');
    expect(document.title).not.toMatch(/SECRET|PRIVATE/);
    expect(document.querySelector('meta[name=robots]')?.getAttribute('content')).toBe('noindex, nofollow');
    expect(document.querySelector('link[rel=canonical]')).toBeNull();
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe('https://natijati-mr.online/');
  });
  it('restores indexability and canonical after leaving a personal search', () => {
    navigate('/search?name=PRIVATE_NAME');
    expect(document.querySelector('meta[name=robots]')?.getAttribute('content')).toContain('noindex');
    navigate('/about');
    expect(document.title).toContain('À propos');
    expect(document.querySelector('meta[name=robots]')?.getAttribute('content')).toBe('index, follow');
    expect(document.querySelector('link[rel=canonical]')?.getAttribute('href')).toBe('https://natijati-mr.online/about');
  });
  it('updates title when language changes without navigation', () => {
    navigate('/statistics');
    const title = document.title;
    TestBed.inject(I18nService).setLanguage('ar'); TestBed.tick();
    expect(document.title).not.toBe(title);
    expect(document.documentElement.dir).toBe('rtl');
  });
  it('never reflects an invalid exam/year in metadata', () => {
    navigate('/result/PRIVATE/SECRET/10001');
    expect(document.title).not.toMatch(/PRIVATE|SECRET/);
  });
  it('updates paginator labels and handles empty and final pages', () => {
    const paginator = TestBed.inject(LocalizedPaginator); TestBed.tick();
    expect(paginator.nextPageLabel).toBe('Page suivante');
    expect(paginator.getRangeLabel(0,20,0)).toBe('0–0 sur 0');
    expect(paginator.getRangeLabel(1,20,23)).toBe('21–23 sur 23');
    TestBed.inject(I18nService).setLanguage('ar'); TestBed.tick();
    expect(paginator.nextPageLabel).toBe('الصفحة التالية');
    expect(paginator.getRangeLabel(0,20,23)).toContain('من');
  });
});
