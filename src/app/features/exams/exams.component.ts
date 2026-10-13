import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { ExamAvailability } from '../../core/models/public-catalog.models';
import { I18nService } from '../../core/services/i18n.service';
import { PublicCatalogApiService } from '../../core/services/public-catalog-api.service';

export type SessionType =
  | 'NORMAL'
  | 'COMPLEMENTARY';

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [RouterLink, DecimalPipe, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './exams.component.html'
})
export class ExamsComponent {
  readonly i18n = inject(I18nService);
  private readonly api = inject(PublicCatalogApiService);
  readonly loadError = signal(false);
  readonly loading = signal(true);
  readonly exams = signal<ExamAvailability[]>([]);

  constructor() {
    this.api.getExams()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: exams => this.exams.set(exams),
        error: () => this.loadError.set(true)
      });
  }

  sessionLabel(type: SessionType): string {

    switch (type) {

      case 'NORMAL':
        return this.i18n.t('session.normal');

      case 'COMPLEMENTARY':
        return this.i18n.t('session.complementary');
    }
  }
}
