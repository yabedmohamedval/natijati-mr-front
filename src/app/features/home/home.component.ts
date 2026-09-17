import { Component, computed, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ExamAvailability, ExamSessionView } from '../../core/models/public-catalog.models';
import { PublicCatalogApiService } from '../../core/services/public-catalog-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatChipsModule } from '@angular/material/chips';

import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  readonly selectedExam =
    signal<'BAC' | 'BEPC' | 'C1AS'>('BAC');

  private readonly api = inject(PublicCatalogApiService);
  readonly exams = signal<ExamAvailability[]>([]);
  readonly selectedSession = signal<ExamSessionView | null>(null);
  readonly catalogError = signal(false);
  readonly sessions = computed(() =>
    this.exams().find(exam => exam.examType === this.selectedExam())?.sessions ?? []
  );

  constructor() {
    this.api.getExams().pipe(takeUntilDestroyed()).subscribe({
      next: exams => {
        this.exams.set(exams);
        this.selectExam(this.selectedExam());
      },
      error: () => this.catalogError.set(true)
    });
  }

  readonly searchForm = new FormGroup({
    candidateNumber: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^\d+$/)
      ]
    })
  });

  get candidateNumber(): FormControl<string> {
    return this.searchForm.controls.candidateNumber;
  }

  readonly canSearch = computed(
    () => this.selectedSession() !== null
  );

  selectExam(exam: 'BAC' | 'BEPC' | 'C1AS'): void {
    this.selectedExam.set(exam);
    const sessions = this.sessions();
    const latestYear = Math.max(...sessions.map(session => session.year));
    this.selectedSession.set(
      sessions.find(session => session.year === latestYear && session.sessionType === 'NORMAL')
      ?? sessions.find(session => session.year === latestYear)
      ?? null
    );
  }

  search(): void {
    this.searchForm.markAllAsTouched();
    const session = this.selectedSession();
    if (this.searchForm.invalid || !session) return;

    void this.router.navigate([
      '/result',
      this.selectedExam().toLowerCase(),
      session.year,
      this.candidateNumber.value.trim()
    ], { queryParams: { sessionType: session.sessionType } });
  }
}
