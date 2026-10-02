import { TestBed } from '@angular/core/testing';

import { provideTestApp } from '../testing/test-helpers';
import { AppComponent } from './app';
import { routes } from './app.routes';

describe('AppComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [AppComponent], providers: provideTestApp() }));

  it('renderiza o container do Ionic com o router outlet', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('ion-app ion-router-outlet')).not.toBeNull();
  });

  it('protege as rotas internas e a administração', () => {
    const shell = routes.find((route) => route.path === '')!;
    expect(shell.canActivate?.length).toBe(1);
    expect(shell.children?.find((route) => route.path === 'admin')?.canActivate?.length).toBe(1);
    expect(routes.find((route) => route.path === 'login')?.canActivate?.length).toBe(1);
  });
});
