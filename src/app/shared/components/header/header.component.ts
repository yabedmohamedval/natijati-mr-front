import { Component, inject } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { I18nService, TranslationKey } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  readonly i18n = inject(I18nService);
  readonly navigation: ReadonlyArray<{ path: string; label: TranslationKey; icon: string }> = [
    { path: '/', label: 'nav.home', icon: 'home' },
    { path: '/exams', label: 'nav.exams', icon: 'school' },
    { path: '/search', label: 'nav.advancedSearch', icon: 'manage_search' },
    { path: '/statistics', label: 'nav.statistics', icon: 'bar_chart' },
    { path: '/institutions', label: 'nav.institutions', icon: 'account_balance' },
    { path: '/about', label: 'nav.about', icon: 'info' }
  ];
}
