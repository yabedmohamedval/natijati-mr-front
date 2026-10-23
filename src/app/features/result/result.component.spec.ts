import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ResultComponent } from './result.component';
import { I18nService } from '../../core/services/i18n.service';

describe('ResultComponent routed rendering', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;
  beforeEach(async () => {
    await TestBed.configureTestingModule({providers:[provideRouter([{path:'result/:examType/:year/:candidateNumber',component:ResultComponent}]),provideHttpClient(),provideHttpClientTesting()]}).compileComponents();
    TestBed.inject(I18nService).setLanguage('fr'); http=TestBed.inject(HttpTestingController); harness=await RouterTestingHarness.create();
  });
  afterEach(() => http.verify());
  const text = () => harness.routeNativeElement?.textContent ?? '';
  for (const exam of ['bac','bepc','c1as']) {
    it(`${exam}: renders loading then the routed result and its session`, async () => {
      await harness.navigateByUrl(`/result/${exam}/2024/001?sessionType=COMPLEMENTARY`,ResultComponent);
      expect(text()).toContain(TestBed.inject(I18nService).t('result.loading'));
      const req=http.expectOne(r=>r.url.endsWith(`/${exam}/2024/${exam==='c1as'?'dossier/':''}001`) && r.params.get('sessionType')==='COMPLEMENTARY');
      req.flush({examType:exam.toUpperCase(),year:2024,identifier:'001',nameFr:'Candidat fictif',score:14,sessionType:'COMPLEMENTARY'}); harness.detectChanges();
      expect(text()).toContain('Candidat fictif'); expect(text()).toContain('2024');
      expect(text()).toContain(TestBed.inject(I18nService).t('session.complementary'));
      expect(text()).not.toContain(TestBed.inject(I18nService).t('result.loading'));
    });
  }
  for (const status of [404,500]) {
    it(`renders the appropriate HTTP ${status} message`, async () => {
      await harness.navigateByUrl('/result/bac/2025/123');
      http.expectOne(r=>r.url.endsWith('/123')).flush({}, {status,statusText:'Failure'});harness.detectChanges();
      expect(text()).toContain(TestBed.inject(I18nService).t(status===404?'result.notFound':'result.error'));
      expect(harness.routeNativeElement?.querySelector('section')).toBeNull();
    });
  }
  it('removes the previous name immediately when the route changes', async () => {
    await harness.navigateByUrl('/result/bac/2025/123');
    http.expectOne(r=>r.url.endsWith('/123')).flush({examType:'BAC',year:2025,identifier:'123',nameFr:'Ancien candidat'});harness.detectChanges();
    expect(text()).toContain('Ancien candidat');
    await harness.navigateByUrl('/result/bepc/2024/456');
    expect(text()).not.toContain('Ancien candidat'); expect(text()).toContain(TestBed.inject(I18nService).t('result.loading'));
    http.expectOne(r=>r.url.endsWith('/456')).flush({examType:'BEPC',year:2024,identifier:'456',nameFr:'Nouveau candidat'});harness.detectChanges();
    expect(text()).toContain('Nouveau candidat');
  });

  for (const exam of ['bac', 'bepc', 'c1as']) {
    it(`${exam}: preserves score units and omits absent decision, series and centre`, async () => {
      await harness.navigateByUrl(`/result/${exam}/2026/001`);
      http.expectOne(r => r.url.endsWith('/001')).flush({examType:exam.toUpperCase(),year:2026,sessionType:'NORMAL',identifier:'001',nameFr:'Candidat fictif',score:exam==='c1as'?180:14,decisionLabel:null,decisionCode:null,seriesFr:null,seriesAr:null,examCenterFr:null,examCenterAr:null}); harness.detectChanges();
      const score = harness.routeNativeElement?.querySelector('.score-box')?.textContent ?? '';
      expect(score).toContain(exam === 'c1as' ? '180.00' : '14.00');
      expect(score.includes('/ 20')).toBe(exam !== 'c1as');
      expect(harness.routeNativeElement?.querySelector('.decision-box')).toBeNull();
      expect(harness.routeNativeElement?.querySelectorAll('.detail-item').length).toBe(2);
      const live = Array.from(harness.routeNativeElement?.querySelectorAll('[role=status], [role=alert]') ?? []);
      expect(live.some(e => e.textContent?.includes('Candidat fictif'))).toBeFalse();
      if (exam === 'c1as') expect(text()).toContain(TestBed.inject(I18nService).t('result.dossier'));
    });
  }
});
