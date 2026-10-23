import { Component, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ExamType } from '../../../core/models/public-catalog.models';
import { I18nService, TranslationKey } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-exam-selector',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="exam-options" role="group" [attr.aria-label]="i18n.t('advanced.exam')">
      @for (exam of exams; track exam.type) {
        <button type="button" class="exam-option" [class.selected]="selected() === exam.type"
          [attr.data-exam]="exam.type" [attr.aria-pressed]="selected() === exam.type"
          (click)="selectedChange.emit(exam.type)">
          <span class="exam-icon"><mat-icon>{{ exam.icon }}</mat-icon></span>
          <span class="exam-copy"><strong><bdi>{{ exam.type }}</bdi></strong><span>{{ i18n.t(exam.label) }}</span></span>
          @if (selected() === exam.type) { <span class="selection-mark" aria-hidden="true"><mat-icon>check_circle</mat-icon></span> }
        </button>
      }
    </div>
  `,
  styleUrl: './exam-selector.component.scss'
})
export class ExamSelectorComponent {
  readonly i18n = inject(I18nService);
  readonly selected = input.required<ExamType>();
  readonly selectedChange = output<ExamType>();
  readonly exams: ReadonlyArray<{ type: ExamType; label: TranslationKey; icon: string }> = [
    { type: 'BAC', label: 'exam.bac', icon: 'school' },
    { type: 'BEPC', label: 'exam.bepc', icon: 'menu_book' },
    { type: 'C1AS', label: 'exam.c1as', icon: 'groups' }
  ];
}
