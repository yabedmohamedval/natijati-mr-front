import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExamResult } from '../models/exam-result.model';
import { ExamType, SessionType } from '../models/public-catalog.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ResultsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/public/results`;

  getResult(examType: ExamType, year: number, identifier: string,
            sessionType: SessionType = 'NORMAL'): Observable<ExamResult> {
    const examPath = examType.toLowerCase();
    const identifierPath = examType === 'C1AS' ? 'dossier/' : '';
    return this.http.get<ExamResult>(
      `${this.baseUrl}/${examPath}/${year}/${identifierPath}${encodeURIComponent(identifier)}`,
      { params: { sessionType } }
    );
  }
}
