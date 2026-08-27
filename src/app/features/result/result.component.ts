import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { catchError, finalize, of } from 'rxjs';
import { ExamResult } from '../../core/models/exam-result.model';
import { I18nService } from '../../core/services/i18n.service';
import { ResultsApiService } from '../../core/services/results-api.service';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
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
    console.log('[ResultComponent] Composant créé');

    const yearParam =
      this.route.snapshot.paramMap.get('year');

    const candidateNumberParam =
      this.route.snapshot.paramMap.get('candidateNumber');

    console.log('[ResultComponent] Paramètre year brut :', yearParam);
    console.log(
      '[ResultComponent] Paramètre candidateNumber brut :',
      candidateNumberParam
    );

    const year = Number(yearParam);

    const candidateNumber =
      candidateNumberParam ?? '';

    console.log('[ResultComponent] Paramètres utilisés :', {
      year,
      candidateNumber
    });

    if (
      Number.isNaN(year) ||
      !candidateNumber.trim()
    ) {
      console.error(
        '[ResultComponent] Paramètres de route invalides',
        {
          year,
          candidateNumber
        }
      );

      this.errorType.set('error');
      this.loading.set(false);
      return;
    }

    this.api
      .getBacResult(year, candidateNumber)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error(
            '[ResultComponent] Erreur HTTP complète :',
            error
          );

          console.error(
            '[ResultComponent] Status HTTP :',
            error.status
          );

          console.error(
            '[ResultComponent] Status text :',
            error.statusText
          );

          console.error(
            '[ResultComponent] URL en erreur :',
            error.url
          );

          console.error(
            '[ResultComponent] Message :',
            error.message
          );

          console.error(
            '[ResultComponent] Corps de la réponse :',
            error.error
          );

          this.errorType.set(
            error.status === 404
              ? 'not-found'
              : 'error'
          );

          return of(null);
        }),

        finalize(() => {
          console.log(
            '[ResultComponent] Fin de la requête'
          );

          this.loading.set(false);
        })
      )
      .subscribe({
        next: result => {
          console.log(
            '[ResultComponent] Réponse reçue :',
            result
          );

          this.result.set(result);
        },

        error: error => {
          console.error(
            '[ResultComponent] Erreur non interceptée :',
            error
          );
        },

        complete: () => {
          console.log(
            '[ResultComponent] Observable terminé'
          );
        }
      });
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
