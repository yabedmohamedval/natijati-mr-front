import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ExamsComponent } from './exams.component';
import { I18nService } from '../../core/services/i18n.service';
import { PublicCatalogApiService } from '../../core/services/public-catalog-api.service';

describe('UI-3 archives presentation', () => {
  function render(exams: unknown[]) {
    TestBed.configureTestingModule({ imports: [ExamsComponent], providers: [provideRouter([]),
      { provide: PublicCatalogApiService, useValue: { getExams: () => of(exams) } }
    ] });
    TestBed.inject(I18nService).setLanguage('fr');
    const fixture = TestBed.createComponent(ExamsComponent); fixture.detectChanges(); return fixture;
  }
  it('announces an empty catalogue without inventing exam cards', () => {
    const fixture = render([]);
    expect(fixture.nativeElement.querySelector('.catalog-empty [role=status]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.archive-card')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('h1').length).toBe(1);
  });
  it('keeps the actual session context and zero result count in its navigable link', () => {
    const fixture = render([{examType:'C1AS',available:true,sessions:[{id:7,year:2024,sessionType:'COMPLEMENTARY',resultCount:0}]}]);
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('.session-link');
    expect(link.getAttribute('href')).toBe('/search?examType=C1AS&year=2024&sessionType=COMPLEMENTARY');
    expect(link.textContent).toContain('2024'); expect(link.querySelector('.session-summary strong')?.textContent).toBe('0');
    TestBed.inject(I18nService).setLanguage('ar'); fixture.detectChanges();
    expect(link.textContent).toContain(TestBed.inject(I18nService).t('session.complementary'));
  });
  it('shows an unavailable exam without creating a session action', () => {
    const fixture = render([{examType:'BAC',available:false,sessions:[]}]);
    expect(fixture.nativeElement.querySelector('.unavailable').textContent).toContain(TestBed.inject(I18nService).t('exam.soon'));
    expect(fixture.nativeElement.querySelector('.session-empty')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.session-link')).toBeNull();
  });
});
