import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './about.component.html'
})
export class AboutComponent {
  readonly i18n = inject(I18nService);
}
