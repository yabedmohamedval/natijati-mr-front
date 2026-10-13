import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PublicCatalogApiService } from './public-catalog-api.service';
import { environment } from '../../../environments/environment';

describe('PublicCatalogApiService HTTP contract', () => {
  let api: PublicCatalogApiService;
  let http: HttpTestingController;
  const base = `${environment.apiUrl}/public/catalog`;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(PublicCatalogApiService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('retrieves the published exam catalog', () => {
    const next = jasmine.createSpy('next'); api.getExams().subscribe(next);
    const req = http.expectOne(`${base}/exams`); expect(req.request.method).toBe('GET');
    req.flush([]); expect(next).toHaveBeenCalledOnceWith([]);
  });
  it('retrieves sessions for the requested exam', () => {
    api.getSessions('C1AS').subscribe(); http.expectOne(`${base}/exams/C1AS/sessions`).flush([]);
  });
  it('searches with all filters, trimmed optional values and explicit pagination', () => {
    api.search({ examType: 'C1AS', year: 2024, sessionType: 'COMPLEMENTARY', candidateNumber: ' 001 ', name: ' Test ', wilaya: ' W ', institution: ' I ', series: ' S ', page: 2, size: 10 }).subscribe();
    const req = http.expectOne(r => r.url === `${base}/search`);
    const expected = { examType: 'C1AS', year: '2024', sessionType: 'COMPLEMENTARY', candidateNumber: '001', name: 'Test', wilaya: 'W', institution: 'I', series: 'S', page: '2', size: '10' };
    for (const [key, value] of Object.entries(expected)) expect(req.request.params.get(key)).withContext(key).toBe(value);
    req.flush({ content: [] });
  });
  it('omits blank filters and supplies default pagination', () => {
    api.search({ examType: 'BAC', year: 2025, sessionType: 'NORMAL', name: '  ' }).subscribe();
    const req = http.expectOne(r => r.url === `${base}/search`);
    expect(req.request.params.keys().sort()).toEqual(['examType', 'page', 'sessionType', 'size', 'year']);
    expect(req.request.params.get('page')).toBe('0'); expect(req.request.params.get('size')).toBe('20'); req.flush({});
  });
  it('requests statistics with exam, year and session', () => {
    api.getStatistics('BEPC', 2024, 'COMPLEMENTARY').subscribe();
    const req = http.expectOne(r => r.url === `${base}/statistics/BEPC/2024`);
    expect(req.request.params.get('sessionType')).toBe('COMPLEMENTARY'); req.flush({});
  });
  it('filters and paginates institutions', () => {
    api.getInstitutions('BEPC', 2024, ' Lycée ', 2, 10, 'COMPLEMENTARY').subscribe();
    const req = http.expectOne(r => r.url === `${base}/institutions`);
    for (const [key,value] of Object.entries({examType:'BEPC',year:'2024',query:'Lycée',page:'2',size:'10',sessionType:'COMPLEMENTARY'})) expect(req.request.params.get(key)).toBe(value);
    req.flush({});
  });
  it('omits empty institution queries and applies defaults', () => {
    api.getInstitutions('BAC', 2025).subscribe();
    const req = http.expectOne(r => r.url === `${base}/institutions`);
    expect(req.request.params.has('query')).toBeFalse(); expect(req.request.params.get('sessionType')).toBe('NORMAL');
    expect(req.request.params.get('page')).toBe('0'); expect(req.request.params.get('size')).toBe('20'); req.flush({});
  });
  it('encodes the opaque institution ID without losing the session', () => {
    api.getInstitution('BAC/2024/école', 'COMPLEMENTARY').subscribe();
    const req = http.expectOne(r => r.url === `${base}/institutions/BAC%2F2024%2F%C3%A9cole`);
    expect(req.request.params.get('sessionType')).toBe('COMPLEMENTARY'); req.flush({});
  });
});
