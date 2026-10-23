import { UiStateComponent } from '../../shared/components/ui-state/ui-state.component';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { catchError, combineLatest, finalize, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ExamType, SessionType } from '../../core/models/public-catalog.models';
import { ExamResult } from '../../core/models/exam-result.model';
import { I18nService } from '../../core/services/i18n.service';
import { ResultsApiService } from '../../core/services/results-api.service';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [UiStateComponent, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss'
})
export class ResultComponent {
  readonly i18n = inject(I18nService);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ResultsApiService);
  readonly loading = signal(true);
  readonly result = signal<ExamResult | null>(null);
  readonly errorType = signal<'not-found' | 'error' | null>(null);
  readonly primaryName = computed(() => {
    const result = this.result();
    return this.i18n.isArabic() ? result?.nameAr || result?.nameFr : result?.nameFr || result?.nameAr;
  });
  readonly secondaryName = computed(() => {
    const result = this.result();
    return this.i18n.isArabic() ? result?.nameFr : result?.nameAr;
  });

  constructor() {
    combineLatest([this.route.paramMap, this.route.queryParamMap]).pipe(
      switchMap(([params, query]) => {
        const examType = params.get('examType')?.toUpperCase();
        const year = Number(params.get('year'));
        const identifier = params.get('candidateNumber')?.trim() ?? '';
        const sessionType = query.get('sessionType') ?? 'NORMAL';
        this.result.set(null);
        this.errorType.set(null);
        if (!['BAC', 'BEPC', 'C1AS'].includes(examType ?? '') ||
            !Number.isInteger(year) || year <= 0 || !identifier ||
            !['NORMAL', 'COMPLEMENTARY'].includes(sessionType)) {
          this.errorType.set('error');
          this.loading.set(false);
          return of(null);
        }
        this.loading.set(true);
        return this.api.getResult(examType as ExamType, year, identifier, sessionType as SessionType).pipe(
          catchError((error: HttpErrorResponse) => {
            this.errorType.set(error.status === 404 ? 'not-found' : 'error');
            return of(null);
          }),
          finalize(() => this.loading.set(false))
        );
      }),
      takeUntilDestroyed()
    ).subscribe(result => this.result.set(result));
  }

  display(localizedFr: string | null, localizedAr: string | null): string {
    return (this.i18n.isArabic() ? localizedAr || localizedFr : localizedFr || localizedAr) ?? '—';
  }

  decisionClass(code: string | null): string {
    if (code === 'ADMITTED') return 'success';
    if (code === 'SECOND_SESSION') return 'warning';
    if (code === 'CANCELLED' || code === 'FAILED') return 'danger';
    return 'neutral';
  }
}
