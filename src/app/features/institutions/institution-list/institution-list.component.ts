import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import {
  ExamType,
  InstitutionSummary,
  PageResponse
} from '../../../core/models/public-catalog.models';
import { I18nService } from '../../../core/services/i18n.service';
import { PublicCatalogApiService } from '../../../core/services/public-catalog-api.service';

@Component({
  selector: 'app-institution-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './institution-list.component.html'
})
export class InstitutionListComponent {
  readonly i18n = inject(I18nService);
  private readonly api = inject(PublicCatalogApiService);

  readonly loading = signal(false);
  readonly page = signal<PageResponse<InstitutionSummary> | null>(null);
  readonly examTypes: ExamType[] = ['BAC', 'BEPC', 'C1AS'];
  readonly years = [2026, 2025, 2024];

  readonly form = new FormGroup({
    examType: new FormControl<ExamType>('BAC', { nonNullable: true }),
    year: new FormControl(2026, { nonNullable: true }),
    query: new FormControl('', { nonNullable: true })
  });

  constructor() {
    this.load();
  }

  load(pageIndex = 0, pageSize = 20): void {
    const { examType, year, query } = this.form.getRawValue();
    this.loading.set(true);

    this.api.getInstitutions(examType, year, query, pageIndex, pageSize)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: page => this.page.set(page),
        error: error => console.error('[Institutions] Erreur', error)
      });
  }

  changePage(event: PageEvent): void {
    this.load(event.pageIndex, event.pageSize);
  }

  name(item: InstitutionSummary): string {
    return this.i18n.isArabic()
      ? item.nameAr || item.nameFr || '—'
      : item.nameFr || item.nameAr || '—';
  }

  wilaya(item: InstitutionSummary): string {
    return this.i18n.isArabic()
      ? item.wilayaAr || item.wilayaFr || '—'
      : item.wilayaFr || item.wilayaAr || '—';
  }
}
