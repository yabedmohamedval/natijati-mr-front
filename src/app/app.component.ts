import { BidiModule } from '@angular/cdk/bidi';
import { I18nService } from './core/services/i18n.service';
import { PageMetadataService } from './core/services/page-metadata.service';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PwaStatusComponent } from './shared/components/pwa-status/pwa-status.component';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BidiModule, RouterOutlet, HeaderComponent, PwaStatusComponent],
  template: `
    <div [dir]="i18n.direction()" class="min-h-screen bg-[var(--page-bg)] text-[var(--text-main)]">
      <a class="skip-link" href="#main-content" (click)="skip($event)">{{ i18n.t('a11y.skip') }}</a>
      <app-header />
      <app-pwa-status />
      <router-outlet (activate)="activate()" />
    </div>
  `
})
export class AppComponent {
  readonly i18n = inject(I18nService);
  private readonly metadata = inject(PageMetadataService);
  private firstActivation = true;
  skip(event: Event): void {
    event.preventDefault();
    document.getElementById('main-content')?.focus();
  }
  activate(): void {
    if (this.firstActivation) { this.firstActivation = false; return; }
    requestAnimationFrame(() => document.getElementById('main-content')?.focus());
  }
}
