import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
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
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.api.getInstitution(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: detail => this.detail.set(detail),
        error: error => console.error('[InstitutionDetail] Erreur', error)
      });
  }

  label(fr: string | null, ar: string | null, fallback: string | null = null): string {
    return (this.i18n.isArabic() ? ar || fr : fr || ar) || fallback || '—';
  }
}
