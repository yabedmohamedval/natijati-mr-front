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
    MatChipsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  readonly selectedExam =
    signal<'BAC' | 'BEPC' | 'C1AS'>('BAC');

  readonly year = signal(2026);

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
    () => this.selectedExam() === 'BAC'
  );

  selectExam(exam: 'BAC' | 'BEPC' | 'C1AS'): void {
    this.selectedExam.set(exam);
  }

  search(): void {
    console.log('search() appelée');
    console.log('Valeur :', this.candidateNumber.value);
    console.log('Valide :', this.candidateNumber.valid);
    console.log('Examen :', this.selectedExam());
    console.log('Recherche autorisée :', this.canSearch());

    this.searchForm.markAllAsTouched();

    if (
      this.searchForm.invalid ||
      !this.canSearch()
    ) {
      return;
    }

    const candidateNumber =
      this.candidateNumber.value.trim();

    void this.router.navigate([
      '/result/bac',
      this.year(),
      candidateNumber
    ]).then(navigationSucceeded => {
      console.log(
        'Navigation réussie :',
        navigationSucceeded
      );
    }).catch(error => {
      console.error(
        'Erreur de navigation :',
        error
      );
    });
  }
}