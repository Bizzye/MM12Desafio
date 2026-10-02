import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';

import { provideTestApp, signInAs } from '../../../testing/test-helpers';
import { DEMO_ADMIN, DEMO_STOCKIST } from '../infra/in-memory/demo-data';
import { adminGuard, authGuard, guestGuard } from './auth.guards';

describe('auth guards', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: provideTestApp() }));

  const run = (guard: CanActivateFn) =>
    firstValueFrom(
      TestBed.runInInjectionContext(
        () => guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot) as Observable<boolean | UrlTree>,
      ),
    );
  const redirect = (path: string) => TestBed.inject(Router).createUrlTree([path]);

  it('visitante: só acessa o login', async () => {
    expect(await run(authGuard)).toEqual(redirect('/login'));
    expect(await run(adminGuard)).toEqual(redirect('/home'));
    expect(await run(guestGuard)).toBeTrue();
  });

  it('estoquista: acessa rotas internas, mas não a administração', async () => {
    await signInAs(DEMO_STOCKIST);
    expect(await run(authGuard)).toBeTrue();
    expect(await run(adminGuard)).toEqual(redirect('/home'));
    expect(await run(guestGuard)).toEqual(redirect('/home'));
  });

  it('administrador: acessa tudo', async () => {
    await signInAs(DEMO_ADMIN);
    expect(await run(authGuard)).toBeTrue();
    expect(await run(adminGuard)).toBeTrue();
  });
});
