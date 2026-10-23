import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { StatisticsComponent } from './statistics.component';
import { I18nService } from '../../core/services/i18n.service';

describe('Statistics dashboard presentation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [StatisticsComponent], providers: [provideHttpClient(), provideHttpClientTesting(), provideNoopAnimations()] });
    TestBed.inject(I18nService).setLanguage('fr');
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('renders actual KPI values, zero counts, missing average and empty distributions', () => {
    const fixture = TestBed.createComponent(StatisticsComponent); fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne(r => r.url.includes('/statistics/')).flush({examType:'C1AS',year:2024,sessionType:'COMPLEMENTARY',candidateCount:0,admittedCount:0,successRate:0,averageScore:null,secondSessionCount:0,byWilaya:[],bySeries:[]}); fixture.detectChanges();
    const values = [...fixture.nativeElement.querySelectorAll('.stat-card strong')].map((e: any) => e.textContent.trim());
    expect(values).toEqual(['0','0','0.00%','—','0']);
    expect(fixture.nativeElement.querySelector('.dashboard-context').textContent).toContain('2024');
    expect(fixture.nativeElement.querySelector('.dashboard-context').textContent).toContain(TestBed.inject(I18nService).t('session.complementary'));
    expect(fixture.nativeElement.querySelector('app-ui-state [role=status]')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.distribution-empty').length).toBe(2);
  });
  it('shows API distribution labels, counts and percentages without inferred trends', () => {
    const fixture = TestBed.createComponent(StatisticsComponent); fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne(r => r.url.includes('/statistics/')).flush({examType:'BAC',year:2026,sessionType:'NORMAL',candidateCount:100,admittedCount:78,successRate:78,averageScore:12.5,secondSessionCount:2,byWilaya:[{code:'TEST',labelFr:'Wilaya test',count:40,percentage:40}],bySeries:[]}); fixture.detectChanges();
    const row = fixture.nativeElement.querySelector('.distribution-label');
    expect(row.textContent).toContain('Wilaya test'); expect(row.textContent).toContain('40%');
    expect(fixture.nativeElement.querySelector('.distribution-track > div').style.width).toBe('40%');
    expect(fixture.nativeElement.querySelector('.kpi-grid').textContent).not.toContain('+');
  });
});
