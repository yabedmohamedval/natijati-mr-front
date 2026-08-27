import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import { I18nService } from '../../core/services/i18n.service';
import { PublicCatalogApiService } from '../../core/services/public-catalog-api.service';
import {
  ExamType,
  PageResponse,
  SearchCriteria,
  SearchResultItem
} from '../../core/models/public-catalog.models';

@Component({
  selector: 'app-search',
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
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  readonly i18n = inject(I18nService);
  private readonly api = inject(PublicCatalogApiService);

  readonly loading = signal(false);
  readonly searched = signal(false);
  readonly response = signal<PageResponse<SearchResultItem> | null>(null);
  readonly years = [2026, 2025, 2024];
  readonly examTypes: ExamType[] = ['BAC', 'BEPC', 'C1AS'];

  readonly form = new FormGroup({
    examType: new FormControl<ExamType>('BAC', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    year: new FormControl(2026, {
      nonNullable: true,
      validators: [Validators.required]
    }),
    candidateNumber: new FormControl('', { nonNullable: true }),
    name: new FormControl('', { nonNullable: true }),
    wilaya: new FormControl('', { nonNullable: true }),
    series: new FormControl('', { nonNullable: true }),
    institution: new FormControl('', { nonNullable: true })
  });

  search(page = 0, size = 20): void {
    if (this.form.invalid || this.loading()) return;

    const value = this.form.getRawValue();
    const criteria: SearchCriteria = {
      ...value,
      page,
      size
    };

    this.loading.set(true);
    this.searched.set(true);

    this.api.search(criteria)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: response => this.response.set(response),
        error: error => {
          console.error('[AdvancedSearch] Erreur', error);
          this.response.set(null);
        }
      });
  }

  changePage(event: PageEvent): void {
    this.search(event.pageIndex, event.pageSize);
  }

  reset(): void {
    this.form.reset({
      examType: 'BAC',
      year: 2026,
      candidateNumber: '',
      name: '',
      wilaya: '',
      series: '',
      institution: ''
    });
    this.response.set(null);
    this.searched.set(false);
  }

  localizedName(item: SearchResultItem): string {
    return this.i18n.isArabic()
      ? item.nameAr || item.nameFr || '—'
      : item.nameFr || item.nameAr || '—';
  }

  localizedWilaya(item: SearchResultItem): string {
    return this.i18n.isArabic()
      ? item.wilayaAr || item.wilayaFr || '—'
      : item.wilayaFr || item.wilayaAr || '—';
  }

  localizedInstitution(item: SearchResultItem): string {
    return this.i18n.isArabic()
      ? item.institutionAr || item.institutionFr || '—'
      : item.institutionFr || item.institutionAr || '—';
  }
}
