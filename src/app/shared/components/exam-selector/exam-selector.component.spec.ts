import { TestBed } from '@angular/core/testing';
import { ExamSelectorComponent } from './exam-selector.component';
import { I18nService } from '../../../core/services/i18n.service';

describe('Exam cards', () => {
  it('exposes the selected exam and emits a choice without submitting a form', () => {
    const fixture = TestBed.createComponent(ExamSelectorComponent);
    fixture.componentRef.setInput('selected', 'BAC'); fixture.detectChanges();
    const selected = jasmine.createSpy('selected'); fixture.componentInstance.selectedChange.subscribe(selected);
    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button');
    expect(Array.from(buttons).filter(b => b.getAttribute('aria-pressed') === 'true').length).toBe(1);
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    buttons[2].click(); expect(selected).toHaveBeenCalledOnceWith('C1AS');
    expect(Array.from(buttons).every(b => b.type === 'button' && !b.disabled)).toBeTrue();
  });
  it('keeps the same exam choices with translated Arabic labels', () => {
    const fixture = TestBed.createComponent(ExamSelectorComponent);
    TestBed.inject(I18nService).setLanguage('ar');
    fixture.componentRef.setInput('selected', 'C1AS'); fixture.detectChanges();
    const group = fixture.nativeElement.querySelector('[role=group]');
    expect(group.getAttribute('aria-label')).toBe(TestBed.inject(I18nService).t('advanced.exam'));
    expect(group.textContent).toContain(TestBed.inject(I18nService).t('exam.c1as'));
    expect(group.querySelector('[aria-pressed=true]').textContent).toContain('C1AS');
    TestBed.inject(I18nService).setLanguage('fr'); fixture.detectChanges();
  });
});
