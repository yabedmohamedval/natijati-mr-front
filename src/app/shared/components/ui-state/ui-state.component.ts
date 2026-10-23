import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-ui-state',
  standalone: true,
  imports: [MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="ui-state" [class.ui-state--error]="kind() === 'error'"
      [attr.role]="announce() ? (kind() === 'error' ? 'alert' : 'status') : null">
      @if (kind() === 'loading') {
        <mat-spinner diameter="40" [attr.aria-label]="message()" />
      } @else {
        <mat-icon aria-hidden="true">{{ kind() === 'error' ? 'error_outline' : 'search_off' }}</mat-icon>
      }
      <p>{{ message() }}</p>
      <ng-content />
    </div>
  `,
  styles: `
    :host { display: block; }
    .ui-state { display: grid; justify-items: center; align-content: center; gap: var(--space-4); min-block-size: 220px; padding: var(--space-8) var(--space-5); border: 1px solid var(--color-border); border-radius: var(--radius-card); background: var(--color-surface); color: var(--color-muted); text-align: center; box-shadow: var(--shadow-sm); }
    .ui-state > mat-icon { display: grid; place-items: center; inline-size: 56px; block-size: 56px; border-radius: var(--radius-control); background: var(--color-blue-soft); color: var(--color-blue); font-size: 28px; }
    .ui-state--error > mat-icon { background: var(--color-danger-soft); color: var(--color-danger); }
    p { margin: 0; max-inline-size: 40rem; font-weight: 600; line-height: 1.7; }
  `
})
export class UiStateComponent {
  readonly kind = input<'loading' | 'empty' | 'error'>('empty');
  readonly message = input.required<string>();
  // Pages with an existing live region can avoid a duplicate announcement.
  readonly announce = input(true);
}
