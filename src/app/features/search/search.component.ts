import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { finalize, Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';
import { PublicCatalogApiService } from '../../core/services/public-catalog-api.service';
import {
  ExamType,
  SessionType,
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
    sessionType: new FormControl<SessionType>('NORMAL', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^(NORMAL|COMPLEMENTARY)$/)]
    }),
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

  private activeSearch?: Subscription;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.activeSearch?.unsubscribe());
    inject(ActivatedRoute).queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
      this.activeSearch?.unsubscribe();
      const examType = params.get('examType')?.toUpperCase() as ExamType;
      const year = Number(params.get('year'));
      const sessionType = params.get('sessionType');
      this.form.patchValue({
        examType: this.examTypes.includes(examType) ? examType : 'BAC',
        year: Number.isInteger(year) && year > 0 ? year : 2026,
        sessionType: (sessionType ?? 'NORMAL') as SessionType
      });
      this.response.set(null);
      if (this.form.controls.sessionType.invalid) {
        this.form.controls.sessionType.markAsTouched();
        this.searched.set(true);
        return;
      }
      const selectedYear = this.form.controls.year.value;
      if (!this.years.includes(selectedYear)) this.years.push(selectedYear);
      if (params.has('examType') || params.has('year') || params.has('sessionType')) this.search();
    });
  }

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

    this.activeSearch = this.api.search(criteria)
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
    this.activeSearch?.unsubscribe();
    this.form.reset({
      examType: 'BAC',
      sessionType: 'NORMAL',
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
