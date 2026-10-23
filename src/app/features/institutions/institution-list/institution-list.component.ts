import { UiStateComponent } from '../../../shared/components/ui-state/ui-state.component';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import {
  ExamType,
  SessionType,
  InstitutionSummary,
  PageResponse
} from '../../../core/models/public-catalog.models';
import { I18nService } from '../../../core/services/i18n.service';
import { PublicCatalogApiService } from '../../../core/services/public-catalog-api.service';

@Component({
  selector: 'app-institution-list',
  standalone: true,
  imports: [
    UiStateComponent,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule
  ],
  templateUrl: './institution-list.component.html',
  styleUrl: './institution-list.component.scss'
})
export class InstitutionListComponent {
  readonly i18n = inject(I18nService);
  private readonly api = inject(PublicCatalogApiService);

  readonly loadError = signal(false);
  readonly loading = signal(false);
  readonly page = signal<PageResponse<InstitutionSummary> | null>(null);
  readonly examTypes: ExamType[] = ['BAC', 'BEPC', 'C1AS'];
  readonly years = [2026, 2025, 2024];

  readonly form = new FormGroup({
    sessionType: new FormControl<SessionType>('NORMAL', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^(NORMAL|COMPLEMENTARY)$/)]
    }),
    examType: new FormControl<ExamType>('BAC', { nonNullable: true }),
    year: new FormControl(2026, { nonNullable: true }),
    query: new FormControl('', { nonNullable: true })
  });

  constructor() {
    const params = inject(ActivatedRoute).snapshot.queryParamMap;
    const examType = params.get('examType')?.toUpperCase() as ExamType;
    const year = Number(params.get('year'));
    this.form.patchValue({
      examType: this.examTypes.includes(examType) ? examType : 'BAC',
      year: Number.isInteger(year) && year > 0 ? year : 2026,
      sessionType: (params.get('sessionType') ?? 'NORMAL') as SessionType
    });
    if (this.form.controls.sessionType.invalid) {
      this.form.controls.sessionType.markAsTouched();
      return;
    }
    if (!this.years.includes(this.form.controls.year.value)) this.years.push(this.form.controls.year.value);
    this.load();
  }

  load(pageIndex = 0, pageSize = 20): void {
    if (this.form.invalid || this.loading()) return;
    this.page.set(null);
    const { examType, year, query, sessionType } = this.form.getRawValue();
    this.loadError.set(false);
    this.loading.set(true);

    this.api.getInstitutions(examType, year, query, pageIndex, pageSize, sessionType)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: page => this.page.set(page),
        error: () => this.loadError.set(true)
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
