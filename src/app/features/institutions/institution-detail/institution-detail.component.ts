import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, combineLatest, finalize, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InstitutionDetail } from '../../../core/models/public-catalog.models';
import { I18nService } from '../../../core/services/i18n.service';
import { PublicCatalogApiService } from '../../../core/services/public-catalog-api.service';

@Component({
  selector: 'app-institution-detail',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './institution-detail.component.html'
})
export class InstitutionDetailComponent {
  readonly i18n = inject(I18nService);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PublicCatalogApiService);

  readonly loading = signal(true);
  readonly detail = signal<InstitutionDetail | null>(null);

  constructor() {
    combineLatest([this.route.paramMap, this.route.queryParamMap]).pipe(
      switchMap(([params, query]) => {
        const sessionType = query.get('sessionType') ?? 'NORMAL';
        this.detail.set(null);
        if (sessionType !== 'NORMAL' && sessionType !== 'COMPLEMENTARY') {
          this.loading.set(false);
          return of(null);
        }
        this.loading.set(true);
        return this.api.getInstitution(params.get('id') ?? '', sessionType).pipe(
          catchError(() => of(null)),
          finalize(() => this.loading.set(false))
        );
      }),
      takeUntilDestroyed()
    ).subscribe(detail => this.detail.set(detail));
  }

  label(fr: string | null, ar: string | null, fallback: string | null = null): string {
    return (this.i18n.isArabic() ? ar || fr : fr || ar) || fallback || '—';
  }
}
