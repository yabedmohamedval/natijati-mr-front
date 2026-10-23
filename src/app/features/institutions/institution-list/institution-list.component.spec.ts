import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { InstitutionListComponent } from './institution-list.component';
import { I18nService } from '../../../core/services/i18n.service';
import { PublicCatalogApiService } from '../../../core/services/public-catalog-api.service';

describe('UI-3 institution cards', () => {
  function render(content: unknown[], totalElements = 0) {
    TestBed.configureTestingModule({ imports:[InstitutionListComponent], providers:[provideRouter([]),provideNoopAnimations(),
      {provide:PublicCatalogApiService,useValue:{getInstitutions:()=>of({content,totalElements,page:0,size:20,totalPages:2})}}
    ] });
    TestBed.inject(I18nService).setLanguage('fr');
    const fixture=TestBed.createComponent(InstitutionListComponent); fixture.detectChanges(); return fixture;
  }
  it('uses the API total, preserves missing average and links to the actual session', () => {
    const fixture=render([{id:'demo',examType:'C1AS',year:2024,sessionType:'COMPLEMENTARY',nameFr:'Établissement de test',nameAr:'مؤسسة تجريبية باسم طويل',candidateCount:0,averageScore:null,successRate:0}],25);
    expect(fixture.nativeElement.querySelector('.result-count').textContent.trim()).toBe('25');
    const link=fixture.nativeElement.querySelector('.institution-card');
    expect(link.getAttribute('href')).toBe('/institutions/demo?sessionType=COMPLEMENTARY');
    expect(Array.from(link.querySelectorAll('dd'),(e:any)=>e.textContent.trim())).toEqual(['0','—','0.0%']);
    TestBed.inject(I18nService).setLanguage('ar'); fixture.detectChanges();
    expect(link.querySelector('h3').textContent).toContain('مؤسسة تجريبية باسم طويل');
    expect(link.querySelector('h3').getAttribute('dir')).toBe('auto');
    expect(link.closest('[role=status]')).toBeNull();
  });
  it('shows the empty state and zero total without rendering fake cards', () => {
    const fixture=render([]);
    expect(fixture.nativeElement.querySelector('app-ui-state [role=status]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.result-count').textContent.trim()).toBe('0');
    expect(fixture.nativeElement.querySelector('.institution-card')).toBeNull();
  });
});
