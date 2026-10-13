import { TestBed } from '@angular/core/testing';
import { provideHttpClient, HttpErrorResponse } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ResultsApiService } from './results-api.service';
import { environment } from '../../../environments/environment';

describe('ResultsApiService HTTP contract', () => {
  let api: ResultsApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(ResultsApiService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  for (const exam of ['BAC', 'BEPC', 'C1AS'] as const) {
    it(`${exam}: encodes the identifier and preserves year/session on the actual HTTP request`, () => {
      api.getResult(exam, 2024, '001/23', 'COMPLEMENTARY').subscribe();
      const req = http.expectOne(r => r.url === `${environment.apiUrl}/public/results/${exam.toLowerCase()}/2024/${exam === 'C1AS' ? 'dossier/' : ''}001%2F23`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('sessionType')).toBe('COMPLEMENTARY');
      req.flush({ identifier: '001/23' });
    });
  }
  it('defaults to NORMAL', () => {
    api.getResult('BAC', 2025, '001').subscribe();
    const req = http.expectOne(r => r.params.get('sessionType') === 'NORMAL'); req.flush({});
  });
  for (const status of [404, 500]) {
    it(`propagates HTTP ${status} without retry or session fallback`, () => {
      const error = jasmine.createSpy('error');
      api.getResult('BEPC', 2025, '001', 'COMPLEMENTARY').subscribe({ error });
      http.expectOne(r => r.url.includes('/bepc/')).flush({}, { status, statusText: 'Failure' });
      expect(error).toHaveBeenCalledOnceWith(jasmine.any(HttpErrorResponse));
      expect(error.calls.first().args[0].status).toBe(status);
    });
  }
  it('propagates a network failure', () => {
    const error = jasmine.createSpy('error');
    api.getResult('C1AS', 2025, '001').subscribe({ error });
    http.expectOne(r => r.url.includes('/dossier/')).error(new ProgressEvent('error'));
    expect(error.calls.first().args[0].status).toBe(0);
  });
});
