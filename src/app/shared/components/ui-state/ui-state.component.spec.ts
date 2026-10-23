import { TestBed } from '@angular/core/testing';
import { UiStateComponent } from './ui-state.component';

describe('Shared feedback semantics', () => {
  it('announces empty/error messages and can defer loading announcements to the page', () => {
    const fixture = TestBed.createComponent(UiStateComponent);
    fixture.componentRef.setInput('message', 'Aucun résultat'); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('Aucun résultat');
    fixture.componentRef.setInput('kind', 'error');
    fixture.componentRef.setInput('message', 'حدث خطأ أثناء البحث.'); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('حدث خطأ');
    fixture.componentRef.setInput('kind', 'loading');
    fixture.componentRef.setInput('announce', false); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"], [role="status"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('mat-spinner').getAttribute('aria-label')).toBe('حدث خطأ أثناء البحث.');
  });
});
