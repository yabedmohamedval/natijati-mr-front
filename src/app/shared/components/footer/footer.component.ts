import { Component, inject } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `<footer><div class="ui-container"><strong dir="ltr">Natijati <span>MR</span></strong><p>{{ i18n.t('footer.disclaimer') }}</p></div></footer>`,
  styles: `
    :host { display: block; }
    footer { border-block-start: 1px solid var(--color-border); padding: var(--space-8) var(--page-gutter); background: var(--color-surface); }
    .ui-container { display: flex; align-items: center; justify-content: space-between; gap: var(--space-5); flex-wrap: wrap; }
    strong { color: var(--color-ink); white-space: nowrap; }
    strong span { color: var(--color-brand); }
    p { margin: 0; max-inline-size: 52rem; color: var(--color-muted); font-size: var(--text-sm); line-height: 1.7; }
  `
})
export class FooterComponent { readonly i18n = inject(I18nService); }
