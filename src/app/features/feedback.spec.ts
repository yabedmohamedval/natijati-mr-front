import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { throwError } from 'rxjs';
import { PublicCatalogApiService } from '../core/services/public-catalog-api.service';
import { ExamsComponent } from './exams/exams.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { InstitutionListComponent } from './institutions/institution-list/institution-list.component';
import { InstitutionDetailComponent } from './institutions/institution-detail/institution-detail.component';

for (const component of [ExamsComponent, StatisticsComponent, InstitutionListComponent, InstitutionDetailComponent]) {
  describe(component.name+' failure feedback', () => {
    it('renders an accessible error instead of an empty page', async () => {
      const fail = () => throwError(() => new Error('Synthetic HTTP failure'));
      await TestBed.configureTestingModule({ imports: [component], providers: [provideRouter([]), provideNoopAnimations(),
        { provide: PublicCatalogApiService, useValue: {getExams:fail,getStatistics:fail,getInstitutions:fail,getInstitution:fail} }
      ] }).compileComponents();
      const fixture = TestBed.createComponent(component as typeof ExamsComponent); fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[role=alert]')?.textContent.trim()).toBeTruthy();
      expect(fixture.nativeElement.querySelectorAll('h1').length).toBe(1);
      expect(fixture.nativeElement.querySelector('mat-spinner')).toBeNull();
    });
  });
}
