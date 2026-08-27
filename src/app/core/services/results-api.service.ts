import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExamResult } from '../models/exam-result.model';
import { environment } from '../../../environments/environment'


@Injectable({ providedIn: 'root' })
export class ResultsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl =
    `${environment.apiUrl}/public/results`;

  getBacResult(
    year: number,
    candidateNumber: string
  ): Observable<ExamResult> {

    const url =
      `${this.baseUrl}/bac/${year}/${encodeURIComponent(candidateNumber)}`;

    console.log('[ResultsApiService] Appel API BAC', {
      year,
      candidateNumber,
      url
    });

    return this.http.get<ExamResult>(url);
  }
}
