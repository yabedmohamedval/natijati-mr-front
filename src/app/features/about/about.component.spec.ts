import { TestBed } from '@angular/core/testing';
import { AboutComponent } from './about.component';
import { I18nService } from '../../core/services/i18n.service';

describe('UI-3 about content', () => {
  for (const lang of ['fr','ar'] as const) {
    it(`preserves all factual sections and the independence notice in ${lang}`,()=>{
      TestBed.configureTestingModule({imports:[AboutComponent]});
      const i18n=TestBed.inject(I18nService); i18n.setLanguage(lang);
      const fixture=TestBed.createComponent(AboutComponent); fixture.detectChanges();
      const el:HTMLElement=fixture.nativeElement;
      expect(el.querySelectorAll('h1').length).toBe(1);
      expect(el.querySelectorAll('.about-section').length).toBe(4);
      for(const section of ['mission','sources','privacy','contact'] as const) expect(el.textContent).toContain(i18n.t(`about.${section}Text`));
      expect(el.querySelector('aside')?.textContent).toContain(i18n.t('about.disclaimerText'));
      expect(el.querySelector('aside')?.getAttribute('aria-labelledby')).toBe(el.querySelector('aside h2')?.id);
    });
  }
});
