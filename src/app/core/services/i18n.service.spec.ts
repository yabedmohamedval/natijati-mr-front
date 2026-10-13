import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n.service';

describe('I18nService browser effects', () => {
  let stored: string|null;
  let lang: string;
  let dir: string;
  let arabicFont: boolean;
  beforeEach(()=>{
    stored=localStorage.getItem('natijati-language');lang=document.documentElement.lang;dir=document.documentElement.dir;arabicFont=document.body.classList.contains('arabic-font');
    localStorage.removeItem('natijati-language');TestBed.configureTestingModule({});
  });
  afterEach(()=>{
    TestBed.resetTestingModule();
    if(stored===null)localStorage.removeItem('natijati-language');else localStorage.setItem('natijati-language',stored);
    document.documentElement.lang=lang;document.documentElement.dir=dir;document.body.classList.toggle('arabic-font',arabicFont);
  });
  it('defaults to French and synchronizes the document',()=>{
    const service=TestBed.inject(I18nService);TestBed.tick();
    expect(service.t('nav.home')).toBe('Accueil');expect(document.documentElement.lang).toBe('fr');expect(document.documentElement.dir).toBe('ltr');
  });
  it('restores Arabic and RTL from the saved preference',()=>{
    localStorage.setItem('natijati-language','ar');const service=TestBed.inject(I18nService);TestBed.tick();
    expect(service.isArabic()).toBeTrue();expect(document.documentElement.dir).toBe('rtl');expect(document.documentElement.lang).toBe('ar');
    expect(service.t('nav.home')).not.toBe('Accueil');expect(document.body.classList.contains('arabic-font')).toBeTrue();
  });
  it('toggles both ways and persists the new language',()=>{
    const service=TestBed.inject(I18nService);service.toggleLanguage();TestBed.tick();
    expect(localStorage.getItem('natijati-language')).toBe('ar');expect(document.documentElement.dir).toBe('rtl');
    service.toggleLanguage();TestBed.tick();expect(service.t('nav.home')).toBe('Accueil');expect(document.documentElement.dir).toBe('ltr');expect(localStorage.getItem('natijati-language')).toBe('fr');
  });
  it('falls back to French for an unsupported saved preference',()=>{
    localStorage.setItem('natijati-language','invalid');expect(TestBed.inject(I18nService).language()).toBe('fr');
  });
});
