import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { InstitutionDetailComponent } from './institution-detail.component';
import { I18nService } from '../../../core/services/i18n.service';

describe('UI-3 institution sheet', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;
  beforeEach(async () => {
    TestBed.configureTestingModule({providers:[provideRouter([{path:'institutions/:id',component:InstitutionDetailComponent}]),provideHttpClient(),provideHttpClientTesting()]});
    TestBed.inject(I18nService).setLanguage('fr'); http=TestBed.inject(HttpTestingController); harness=await RouterTestingHarness.create();
  });
  afterEach(()=>http.verify());
  it('renders actual indicators, empty distributions and the contextual return link', async () => {
    await harness.navigateByUrl('/institutions/demo?sessionType=COMPLEMENTARY');
    expect(harness.routeNativeElement?.querySelector('mat-spinner')).not.toBeNull();
    http.expectOne(r=>r.url.endsWith('/institutions/demo')&&r.params.get('sessionType')==='COMPLEMENTARY').flush({summary:{examType:'C1AS',year:2024,sessionType:'COMPLEMENTARY',nameFr:'Établissement de test',nameAr:'مؤسسة تجريبية باسم طويل',candidateCount:0,admittedCount:0,averageScore:null,successRate:0},decisionDistribution:[],seriesDistribution:[]}); harness.detectChanges();
    const el=harness.routeNativeElement!;
    expect(Array.from(el.querySelectorAll('.stat-card strong'),e=>e.textContent?.trim())).toEqual(['0','0','—','0.00%']);
    expect(el.querySelectorAll('.distribution-empty').length).toBe(2);
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/institutions?examType=C1AS&year=2024&sessionType=COMPLEMENTARY');
    expect(el.querySelectorAll('h1').length).toBe(1);
    TestBed.inject(I18nService).setLanguage('ar'); harness.detectChanges();
    expect(el.querySelector('h1')?.textContent).toContain('مؤسسة تجريبية باسم طويل');
    expect(el.querySelector('[role=status]')?.textContent).not.toContain('مؤسسة');
  });
  for(const status of [404,500]) {
    it(`retains accessible HTTP ${status} feedback without a stale institution`,async()=>{
      await harness.navigateByUrl('/institutions/demo');
      http.expectOne(r=>r.url.endsWith('/institutions/demo')).flush({}, {status,statusText:'Synthetic failure'}); harness.detectChanges();
      expect(harness.routeNativeElement?.querySelector('[role=alert]')).not.toBeNull();
      expect(harness.routeNativeElement?.querySelector('.institution-identity')).toBeNull();
      expect(harness.routeNativeElement?.querySelectorAll('h1').length).toBe(1);
    });
  }
});
