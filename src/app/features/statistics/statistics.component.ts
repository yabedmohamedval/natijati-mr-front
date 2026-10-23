import { DecimalPipe } from '@angular/common';
import { UiStateComponent } from '../../shared/components/ui-state/ui-state.component';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import { ExamType, SessionType, StatisticsResponse } from '../../core/models/public-catalog.models';
import { I18nService } from '../../core/services/i18n.service';
import { PublicCatalogApiService } from '../../core/services/public-catalog-api.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [DecimalPipe, UiStateComponent, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatSelectModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent {
  readonly i18n = inject(I18nService);
  private readonly api = inject(PublicCatalogApiService);
  readonly loadError = signal(false);
  readonly loading = signal(false);
  readonly stats = signal<StatisticsResponse | null>(null);
  readonly examTypes: ExamType[] = ['BAC', 'BEPC', 'C1AS'];
  readonly years = [2026, 2025, 2024];

  readonly form = new FormGroup({
    sessionType: new FormControl<SessionType>('NORMAL', { nonNullable: true }),
    examType: new FormControl<ExamType>('BAC', { nonNullable: true }),
    year: new FormControl(2026, { nonNullable: true })
  });

  constructor() { this.load(); }

  load(): void {
    if (this.loading()) return;
    this.stats.set(null);
    const { examType, year, sessionType } = this.form.getRawValue();
    this.loadError.set(false);
    this.loading.set(true);
    this.api.getStatistics(examType, year, sessionType)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: stats => this.stats.set(stats),
        error: () => this.loadError.set(true)
      });
  }

  label(fr: string | null, ar: string | null, code: string | null): string {
    return (this.i18n.isArabic() ? ar || fr : fr || ar) || code || '—';
  }
}
