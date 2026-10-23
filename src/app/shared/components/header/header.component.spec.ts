import { Component, inject } from '@angular/core';
import { BidiModule } from '@angular/cdk/bidi';
import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { HeaderComponent } from './header.component';
import { I18nService } from '../../../core/services/i18n.service';

@Component({ template: '' })
class Destination {}
@Component({ imports: [HeaderComponent, BidiModule], template: '<div [dir]="i18n.direction()"><app-header /></div>' })
class Host { readonly i18n = inject(I18nService); }

describe('Shared navigation', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host], providers: [provideNoopAnimations(), provideRouter([
      { path: '', component: Destination }, { path: 'institutions/:id', component: Destination },
      { path: 'search', component: Destination }
    ])] }).compileComponents();
    TestBed.inject(I18nService).setLanguage('fr');
  });

  it('keeps the section active on a detail route in desktop and mobile navigation', async () => {
    const fixture = TestBed.createComponent(Host); fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/institutions/example'); fixture.detectChanges();
    await fixture.whenStable(); fixture.detectChanges();
    const active = fixture.nativeElement.querySelectorAll('nav [aria-current="page"]');
    expect(active.length).toBe(1);
    expect(active[0].getAttribute('href')).toBe('/institutions');
    const menu = await TestbedHarnessEnvironment.loader(fixture).getHarness(MatMenuHarness);
    await menu.open();
    expect((await menu.getItems()).length).toBe(6);
    const mobileActive = document.querySelector('.mobile-navigation-menu [aria-current="page"]');
    expect(mobileActive?.getAttribute('href')).toBe('/institutions');
    await menu.close();
  });

  it('switches language, including the menu overlay direction and accessible labels', async () => {
    const fixture = TestBed.createComponent(Host); fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('.language-button') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-label')).toBe('العربية');
    toggle.click(); fixture.detectChanges(); await fixture.whenStable();
    expect(document.documentElement.dir).toBe('rtl');
    expect(toggle.getAttribute('aria-label')).toBe('Français');
    const menu = await TestbedHarnessEnvironment.loader(fixture).getHarness(MatMenuHarness);
    await menu.open();
    expect(getComputedStyle(document.querySelector('.cdk-overlay-pane')!).direction).toBe('rtl');
    const items = await menu.getItems();
    expect(await items[0].getText()).toContain('الرئيسية');
    await menu.close();
    TestBed.inject(I18nService).setLanguage('fr'); fixture.detectChanges();
  });
});
