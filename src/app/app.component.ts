import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <div class="min-h-screen bg-[var(--page-bg)] text-[var(--text-main)]">
      <app-header />
      <router-outlet />
    </div>
  `
})
export class AppComponent {}
