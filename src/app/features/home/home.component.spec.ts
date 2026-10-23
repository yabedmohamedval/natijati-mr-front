import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { Subject } from 'rxjs';
import { HomeComponent } from './home.component';
import { PublicCatalogApiService } from '../../core/services/public-catalog-api.service';
import { ExamAvailability } from '../../core/models/public-catalog.models';
import { I18nService } from '../../core/services/i18n.service';

describe('HomeComponent rendered form', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let catalog: Subject<ExamAvailability[]>;
  let navigate: jasmine.Spy;
  beforeEach(async () => {
    catalog = new Subject();
    await TestBed.configureTestingModule({ imports: [HomeComponent], providers: [provideRouter([]), provideNoopAnimations(),
      { provide: PublicCatalogApiService, useValue: { getExams: () => catalog } }
    ] }).compileComponents();
    TestBed.inject(I18nService).setLanguage('fr');
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(HomeComponent); fixture.detectChanges();
  });
  const session = (id: number, year: number, sessionType: 'NORMAL'|'COMPLEMENTARY') =>
    ({ id, year, sessionType, examType: 'C1AS' as const, status: 'PUBLISHED' as const, resultCount: 1, publishedAt: null, sourceFilename: null });
  function publish() {
    catalog.next([{ examType: 'C1AS', available: true, sessions: [session(1,2025,'NORMAL'), session(2,2024,'COMPLEMENTARY')] }]);
    (fixture.nativeElement.querySelectorAll('#exams button')[2] as HTMLButtonElement).click(); fixture.detectChanges();
  }
  function input(value: string) {
    const el: HTMLInputElement = fixture.nativeElement.querySelector('input'); el.value=value; el.dispatchEvent(new Event('input')); fixture.detectChanges();
  }
  it('disables submission until an exam has a published session', () => {
    input('123'); expect(fixture.nativeElement.querySelector('button[type=submit]').disabled).toBeTrue();
    publish(); expect(fixture.nativeElement.querySelector('button[type=submit]').disabled).toBeFalse();
    (fixture.nativeElement.querySelectorAll('#exams button')[0] as HTMLButtonElement).click(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button[type=submit]').disabled).toBeTrue(); expect(navigate).not.toHaveBeenCalled();
  });
  it('rejects blank and nonnumeric input through the rendered form', () => {
    publish();
    for (const value of ['', 'abc', '12 3']) { input(value); expect(fixture.nativeElement.querySelector('button[type=submit]').disabled).toBeTrue(); }
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', {cancelable:true})); expect(navigate).not.toHaveBeenCalled();
  });
  it('selects a published historical session and submits the dossier entered in the DOM', async () => {
    publish();
    const select = await TestbedHarnessEnvironment.loader(fixture).getHarness(MatSelectHarness);
    await select.open(); await select.clickOptions({text: /2024/});
    input('00123'); fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', {cancelable:true}));
    expect(navigate).toHaveBeenCalledOnceWith(['/result','c1as',2024,'00123'], {queryParams:{sessionType:'COMPLEMENTARY'}});
    expect(fixture.nativeElement.querySelector('label[for=candidate-number]').textContent).toContain(TestBed.inject(I18nService).t('result.dossier'));
  });
  it('shows catalog failure and keeps submission disabled', () => {
    catalog.error(new Error('offline')); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(TestBed.inject(I18nService).t('result.error'));
    expect(fixture.nativeElement.querySelector('button[type=submit]').disabled).toBeTrue();
  });
  it('announces the selected exam and associates invalid input with an error', () => {
    publish(); input('invalid');
    const field: HTMLInputElement = fixture.nativeElement.querySelector('input');
    field.dispatchEvent(new Event('blur')); fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('#exams button')[2].getAttribute('aria-pressed')).toBe('true');
    expect(field.getAttribute('aria-invalid')).toBe('true');
    const error = fixture.nativeElement.querySelector('mat-error');
    expect(error.textContent).toContain(TestBed.inject(I18nService).t('search.numericOnly'));
    expect(field.getAttribute('aria-describedby')).toContain(error.id);
  });

  it('uses only the selected published session count, with no static candidate KPI', () => {
    publish();
    const content = fixture.nativeElement.textContent;
    expect(content).not.toContain(TestBed.inject(I18nService).t('stats.candidates'));
    expect(fixture.nativeElement.querySelector('.catalog-status').textContent).toContain('1');
  });
});
