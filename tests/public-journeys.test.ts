import '@angular/compiler';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { ResultsApiService } from '../src/app/core/services/results-api.service';
import { PublicCatalogApiService } from '../src/app/core/services/public-catalog-api.service';
import { I18nService } from '../src/app/core/services/i18n.service';
import { ResultComponent } from '../src/app/features/result/result.component';
import { SearchComponent } from '../src/app/features/search/search.component';
import { HomeComponent } from '../src/app/features/home/home.component';
import { InstitutionDetailComponent } from '../src/app/features/institutions/institution-detail/institution-detail.component';
import { InstitutionListComponent } from '../src/app/features/institutions/institution-list/institution-list.component';
import { StatisticsComponent } from '../src/app/features/statistics/statistics.component';

function setup(t: any, providers: any[] = []) {
  const injector = createEnvironmentInjector([
    { provide: I18nService, useValue: { isArabic: () => false } }, ...providers
  ], null as any);
  t.after(() => injector.destroy());
  return <T>(factory: () => T) => runInInjectionContext(injector, factory);
}

for (const exam of ['BAC', 'BEPC', 'C1AS'] as const) {
  for (const session of ['NORMAL', 'COMPLEMENTARY'] as const) {
    test(`${exam}/${session}: route calls its own endpoint with its public identifier`, t => {
      const calls: any[] = [];
      const params = new BehaviorSubject(convertToParamMap({ examType: exam.toLowerCase(), year: '2026', candidateNumber: '98765' }));
      const query = new BehaviorSubject(convertToParamMap(session === 'NORMAL' ? {} : { sessionType: session }));
      const run = setup(t, [
        { provide: ActivatedRoute, useValue: { paramMap: params, queryParamMap: query } },
        { provide: HttpClient, useValue: { get: (url: string, options: any) => {
          calls.push({ url, options });
          return of({ examType: exam, identifier: '98765', sessionType: session });
        } } },
        { provide: ResultsApiService, useFactory: () => new ResultsApiService() }
      ]);
      const component = run(() => new ResultComponent());
      assert.ok(calls[0].url.endsWith(`/public/results/${exam.toLowerCase()}/2026/${exam === 'C1AS' ? 'dossier/' : ''}98765`));
      assert.equal(calls[0].options.params.sessionType, session);
      assert.equal(component.result()?.examType, exam);
      assert.equal(component.loading(), false);
      query.next(convertToParamMap({ sessionType: session === 'NORMAL' ? 'COMPLEMENTARY' : 'NORMAL' }));
      assert.equal(calls.length, 2);
      assert.notEqual(calls[1].options.params.sessionType, session);
    });
  }
}

test('result rejects unknown exam/session and cancels the previous lookup on navigation', t => {
  const params = new BehaviorSubject(convertToParamMap({ examType: 'bac', year: '2026', candidateNumber: '12' }));
  const query = new BehaviorSubject(convertToParamMap({}));
  const pending: Subject<any>[] = [];
  const run = setup(t, [
    { provide: ActivatedRoute, useValue: { paramMap: params, queryParamMap: query } },
    { provide: ResultsApiService, useValue: { getResult: () => { const s = new Subject(); pending.push(s); return s; } } }
  ]);
  const component = run(() => new ResultComponent());
  query.next(convertToParamMap({ sessionType: 'COMPLEMENTARY' }));
  assert.equal(pending[0].observed, false);
  assert.equal(component.loading(), true);
  pending[1].next({ examType: 'BAC', identifier: '12' }); pending[1].complete();
  assert.equal(component.result()?.identifier, '12');
  query.next(convertToParamMap({ sessionType: 'INVALID' }));
  assert.equal(component.result(), null);
  assert.equal(component.errorType(), 'error');
  params.next(convertToParamMap({ examType: 'other', year: '2026', candidateNumber: '12' }));
  assert.equal(pending.length, 2);
});

test('a missing complementary result stays a 404 and does not fall back to NORMAL', t => {
  let calls = 0;
  const run = setup(t, [
    { provide: ActivatedRoute, useValue: {
      paramMap: of(convertToParamMap({ examType: 'bepc', year: '2026', candidateNumber: '12' })),
      queryParamMap: of(convertToParamMap({ sessionType: 'COMPLEMENTARY' }))
    } },
    { provide: ResultsApiService, useValue: { getResult: () => {
      calls++; return throwError(() => new HttpErrorResponse({ status: 404 }));
    } } }
  ]);
  const component = run(() => new ResultComponent());
  assert.equal(component.errorType(), 'not-found');
  assert.equal(calls, 1);
});

test('archives initialize search with the selected exam, historical year and session', t => {
  const requests: any[] = [];
  const query = new BehaviorSubject(convertToParamMap({ examType: 'C1AS', year: '2023', sessionType: 'COMPLEMENTARY' }));
  const run = setup(t, [
    { provide: ActivatedRoute, useValue: { queryParamMap: query } },
    { provide: PublicCatalogApiService, useValue: { search: (criteria: any) => {
      requests.push(criteria); return of({ content: [], totalElements: 0 });
    } } }
  ]);
  const component = run(() => new SearchComponent());
  assert.equal(requests[0].examType, 'C1AS');
  assert.equal(requests[0].year, 2023);
  assert.equal(requests[0].sessionType, 'COMPLEMENTARY');
  assert.ok(component.years.includes(2023));
  component.form.controls.candidateNumber.setValue('98765');
  component.changePage({ pageIndex: 1, pageSize: 20, length: 30 });
  assert.equal(requests[1].sessionType, 'COMPLEMENTARY');
  assert.equal(requests[1].candidateNumber, '98765');
  query.next(convertToParamMap({ examType: 'BEPC', year: '2025' }));
  assert.equal(requests[2].examType, 'BEPC');
  assert.equal(requests[2].sessionType, 'NORMAL');
});

test('all catalog HTTP reads transmit the selected session', t => {
  const calls: any[] = [];
  const run = setup(t, [{ provide: HttpClient, useValue: { get: (url: string, options: any) => {
    calls.push({ url, params: options.params }); return of(null);
  } } }]);
  const api = run(() => new PublicCatalogApiService());
  api.search({ examType: 'C1AS', year: 2026, sessionType: 'COMPLEMENTARY', candidateNumber: '98765' });
  api.getStatistics('BEPC', 2026, 'COMPLEMENTARY');
  api.getInstitutions('BAC', 2026, '', 0, 20, 'COMPLEMENTARY');
  api.getInstitution('school', 'COMPLEMENTARY');
  for (const { params } of calls) assert.equal(params.get ? params.get('sessionType') : params.sessionType, 'COMPLEMENTARY');
  assert.equal(calls[0].params.get('candidateNumber'), '98765');
});

test('home selects published sessions and routes BEPC/C1AS without a BAC fallback', t => {
  const navigations: any[] = [];
  const run = setup(t, [
    { provide: Router, useValue: { navigate: (...args: any[]) => { navigations.push(args); return Promise.resolve(true); } } },
    { provide: PublicCatalogApiService, useValue: { getExams: () => of([
      { examType: 'BAC', sessions: [] },
      { examType: 'BEPC', sessions: [{ id: 1, year: 2025, sessionType: 'NORMAL' }] },
      { examType: 'C1AS', sessions: [{ id: 2, year: 2024, sessionType: 'COMPLEMENTARY' }] }
    ]) } }
  ]);
  const component = run(() => new HomeComponent());
  component.candidateNumber.setValue('98765');
  component.search();
  assert.equal(navigations.length, 0);
  component.selectExam('BEPC'); component.search();
  component.selectExam('C1AS'); component.search();
  assert.deepEqual(navigations, [
    [['/result', 'bepc', 2025, '98765'], { queryParams: { sessionType: 'NORMAL' } }],
    [['/result', 'c1as', 2024, '98765'], { queryParams: { sessionType: 'COMPLEMENTARY' } }]
  ]);
});

test('statistics, institution pagination and detail retain the session', t => {
  const calls: any[] = [];
  const query = new BehaviorSubject(convertToParamMap({ examType: 'BEPC', year: '2023', sessionType: 'COMPLEMENTARY' }));
  const run = setup(t, [
    { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: query.value }, queryParamMap: query,
      paramMap: of(convertToParamMap({ id: 'school' })) } },
    { provide: PublicCatalogApiService, useValue: {
      getStatistics: (...args: any[]) => { calls.push(args); return of(null); },
      getInstitutions: (...args: any[]) => { calls.push(args); return of(null); },
      getInstitution: (...args: any[]) => { calls.push(args); return of(null); }
    } }
  ]);
  const stats = run(() => new StatisticsComponent());
  stats.form.controls.sessionType.setValue('COMPLEMENTARY'); stats.load();
  const list = run(() => new InstitutionListComponent()); list.load(1, 20);
  run(() => new InstitutionDetailComponent());
  assert.deepEqual(calls, [
    ['BAC', 2026, 'NORMAL'], ['BAC', 2026, 'COMPLEMENTARY'],
    ['BEPC', 2023, '', 0, 20, 'COMPLEMENTARY'], ['BEPC', 2023, '', 1, 20, 'COMPLEMENTARY'],
    ['school', 'COMPLEMENTARY']
  ]);
  query.next(convertToParamMap({ sessionType: 'NORMAL' }));
  assert.deepEqual(calls.at(-1), ['school', 'NORMAL']);
});


test('home defaults to NORMAL in the newest published year, regardless of catalog ordering', t => {
  const sessions = [
    { id: 1, year: 2026, sessionType: 'COMPLEMENTARY' },
    { id: 2, year: 2026, sessionType: 'NORMAL' },
    { id: 3, year: 2025, sessionType: 'NORMAL' }
  ];
  const run = setup(t, [
    { provide: Router, useValue: {} },
    { provide: PublicCatalogApiService, useValue: { getExams: () => of([{ examType: 'BAC', sessions }]) } }
  ]);
  const component = run(() => new HomeComponent());
  assert.equal(component.selectedSession()?.id, 2);
  component.exams.set([{ examType: 'BAC', available: true, sessions: [sessions[0], sessions[2]] as any }]);
  component.selectExam('BAC');
  assert.equal(component.selectedSession()?.id, 1);
});


for (const sessionType of ['INVALID', 'SECOND_SESSION', '']) {
  test(`search and institutions reject invalid URL session '${sessionType}' without NORMAL fallback`, t => {
    const requests: any[] = [];
    const params = convertToParamMap({ examType: 'BAC', year: '2026', sessionType });
    const run = setup(t, [
      { provide: ActivatedRoute, useValue: { queryParamMap: of(params), snapshot: { queryParamMap: params } } },
      { provide: PublicCatalogApiService, useValue: {
        search: (value: any) => { requests.push(value); return of({ content: [] }); },
        getInstitutions: (...args: any[]) => { requests.push(args); return of({ content: [] }); }
      } }
    ]);
    const search = run(() => new SearchComponent());
    const institutions = run(() => new InstitutionListComponent());
    search.search(); institutions.load();
    assert.equal(requests.length, 0);
    assert.equal(search.form.controls.sessionType.invalid, true);
    assert.equal(institutions.form.controls.sessionType.invalid, true);
    search.form.controls.sessionType.setValue('NORMAL'); search.search();
    institutions.form.controls.sessionType.setValue('COMPLEMENTARY'); institutions.load();
    assert.equal(requests.length, 2);
    assert.equal(requests[0].sessionType, 'NORMAL');
    assert.equal(requests[1].at(-1), 'COMPLEMENTARY');
  });
}
