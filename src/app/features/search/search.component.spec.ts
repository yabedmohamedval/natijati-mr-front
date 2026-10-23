import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { SearchComponent } from './search.component';
import { I18nService } from '../../core/services/i18n.service';

describe('SearchComponent rendered interactions', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;
  beforeEach(async () => {
    await TestBed.configureTestingModule({providers:[provideRouter([{path:'search',component:SearchComponent}]),provideHttpClient(),provideHttpClientTesting(),provideNoopAnimations()]}).compileComponents();
    TestBed.inject(I18nService).setLanguage('fr');http=TestBed.inject(HttpTestingController);harness=await RouterTestingHarness.create();
  });
  afterEach(()=>http.verify());
  it('renders a C1AS dossier result link preserving year and session', async () => {
    await harness.navigateByUrl('/search?examType=C1AS&year=2024&sessionType=COMPLEMENTARY');
    const req=http.expectOne(r=>r.url.endsWith('/search'));
    expect(req.request.params.get('examType')).toBe('C1AS');expect(req.request.params.get('year')).toBe('2024');
    req.flush({content:[{examType:'C1AS',year:2024,sessionType:'COMPLEMENTARY',identifier:'00123',nameFr:'Test'}],page:0,size:20,totalElements:1,totalPages:1});harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('a')?.getAttribute('href')).toBe('/result/c1as/2024/00123?sessionType=COMPLEMENTARY');
    expect(harness.routeNativeElement?.textContent).toContain(TestBed.inject(I18nService).t('result.dossier'));
  });
  it('shows invalid session feedback and sends no request', async () => {
    await harness.navigateByUrl('/search?sessionType=INVALID');
    expect(harness.routeNativeElement?.querySelector('mat-error')?.textContent).toContain(TestBed.inject(I18nService).t('result.invalidSession'));
    harness.routeNativeElement?.querySelector('form')?.dispatchEvent(new Event('submit',{cancelable:true}));
    http.expectNone(r=>r.url.endsWith('/search'));
  });
  it('submits DOM criteria and preserves them when clicking next page', async () => {
    await harness.navigateByUrl('/search');
    const input=harness.routeNativeElement?.querySelector('input[formControlName=name]') as HTMLInputElement;
    input.value=' Test ';input.dispatchEvent(new Event('input'));
    harness.routeNativeElement?.querySelector('form')?.dispatchEvent(new Event('submit',{cancelable:true}));
    const req=http.expectOne(r=>r.url.endsWith('/search'));expect(req.request.params.get('name')).toBe('Test');
    req.flush({content:[{examType:'BAC',year:2026,sessionType:'NORMAL',identifier:'123'}],page:0,size:20,totalElements:30,totalPages:2});harness.detectChanges();
    const paginator=await TestbedHarnessEnvironment.loader(harness.fixture).getHarness(MatPaginatorHarness);
    await paginator.goToNextPage();
    const next=http.expectOne(r=>r.url.endsWith('/search'));
    expect(next.request.params.get('page')).toBe('1');expect(next.request.params.get('name')).toBe('Test');expect(next.request.params.get('sessionType')).toBe('NORMAL');
    next.flush({content:[],page:1,size:20,totalElements:30,totalPages:2});harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain(TestBed.inject(I18nService).t('advanced.empty'));
  });

  it('changes the exam through cards, submits C1AS criteria and restores BAC on reset', async () => {
    await harness.navigateByUrl('/search');
    (harness.routeNativeElement?.querySelector('[data-exam=C1AS]') as HTMLButtonElement).click(); harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('[data-exam=C1AS]')?.getAttribute('aria-pressed')).toBe('true');
    expect(harness.routeNativeElement?.textContent).toContain(TestBed.inject(I18nService).t('result.dossier'));
    harness.routeNativeElement?.querySelector('form')?.dispatchEvent(new Event('submit', {cancelable:true}));
    const req = http.expectOne(r => r.url.endsWith('/search'));
    expect(req.request.params.get('examType')).toBe('C1AS');
    req.flush({content:[{examType:'C1AS',year:2026,sessionType:'NORMAL',identifier:'001',score:180,nameFr:'Test',decisionLabel:null}],page:0,size:20,totalElements:1,totalPages:1}); harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('.result-score')?.textContent).toContain('180.00');
    expect(harness.routeNativeElement?.querySelector('.result-score')?.textContent).not.toContain('/ 20');
    expect(harness.routeNativeElement?.querySelector('.result-decision')).toBeNull();
    (harness.routeNativeElement?.querySelector('.filter-actions button[type=button]') as HTMLButtonElement).click(); harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('[data-exam=BAC]')?.getAttribute('aria-pressed')).toBe('true');
    expect(harness.routeNativeElement?.querySelector('.result-row')).toBeNull();
  });
});
