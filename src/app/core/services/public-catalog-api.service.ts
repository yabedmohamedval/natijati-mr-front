import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  inject,
  Injectable
} from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  ExamAvailability,
  ExamSessionView,
  InstitutionDetail,
  InstitutionSummary,
  PageResponse,
  SearchCriteria,
  SearchResultItem,
  StatisticsResponse
} from '../models/public-catalog.models';

@Injectable({
  providedIn: 'root'
})
export class PublicCatalogApiService {

  private readonly http = inject(HttpClient);

  private readonly baseUrl =
    `${environment.apiUrl}/public/catalog`;

  getExams(): Observable<ExamAvailability[]> {
    return this.http.get<ExamAvailability[]>(
      `${this.baseUrl}/exams`
    );
  }

  getSessions(
    examType: string
  ): Observable<ExamSessionView[]> {

    return this.http.get<ExamSessionView[]>(
      `${this.baseUrl}/exams/${encodeURIComponent(examType)}/sessions`
    );
  }

  search(
    criteria: SearchCriteria
  ): Observable<PageResponse<SearchResultItem>> {

    let params = new HttpParams()
      .set('examType', criteria.examType)
      .set('year', criteria.year.toString())
      .set('page', (criteria.page ?? 0).toString())
      .set('size', (criteria.size ?? 20).toString());

    const optionalValues: Record<string, string | undefined> = {
      candidateNumber: criteria.candidateNumber,
      name: criteria.name,
      wilaya: criteria.wilaya,
      series: criteria.series,
      institution: criteria.institution
    };

    for (const [key, value] of Object.entries(optionalValues)) {
      if (value?.trim()) {
        params = params.set(key, value.trim());
      }
    }

    return this.http.get<PageResponse<SearchResultItem>>(
      `${this.baseUrl}/search`,
      { params }
    );
  }

  getStatistics(
    examType: string,
    year: number
  ): Observable<StatisticsResponse> {

    return this.http.get<StatisticsResponse>(
      `${this.baseUrl}/statistics/${encodeURIComponent(examType)}/${year}`
    );
  }

  getInstitutions(
    examType: string,
    year: number,
    query = '',
    page = 0,
    size = 20
  ): Observable<PageResponse<InstitutionSummary>> {

    let params = new HttpParams()
      .set('examType', examType)
      .set('year', year.toString())
      .set('page', page.toString())
      .set('size', size.toString());

    if (query.trim()) {
      params = params.set(
        'query',
        query.trim()
      );
    }

    return this.http.get<PageResponse<InstitutionSummary>>(
      `${this.baseUrl}/institutions`,
      { params }
    );
  }

  getInstitution(
    id: string
  ): Observable<InstitutionDetail> {

    return this.http.get<InstitutionDetail>(
      `${this.baseUrl}/institutions/${encodeURIComponent(id)}`
    );
  }
}