import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { provideTestApp } from '../../../testing/test-helpers';
import { DEMO_ADMIN, DEMO_PASSWORD, DEMO_STOCKIST } from '../infra/in-memory/demo-data';
import { AuthError, ValidationError } from '../utils/app-errors';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: provideTestApp() });
    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
  });

  it('valida e-mail e senha antes de chamar o backend', async () => {
    await expectAsync(service.signIn('   ', 'x')).toBeRejectedWithError(ValidationError, 'Informe e-mail e senha.');
    await expectAsync(service.signIn('a@b.com', '')).toBeRejectedWithError(ValidationError);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('autentica normalizando o e-mail e navega para o início', async () => {
    await service.signIn(`  ${DEMO_ADMIN.email.toUpperCase()} `, DEMO_PASSWORD);

    expect(service.user()).toEqual(DEMO_ADMIN);
    expect(service.isAdmin()).toBeTrue();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/home', { replaceUrl: true });
  });

  it('propaga erro de credenciais inválidas', async () => {
    await expectAsync(service.signIn(DEMO_ADMIN.email, 'errada')).toBeRejectedWithError(AuthError);
    expect(service.user()).toBeNull();
  });

  it('encerra a sessão e volta para o login', async () => {
    await service.signIn(DEMO_STOCKIST.email, DEMO_PASSWORD);
    await service.signOut();

    expect(service.user()).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login', { replaceUrl: true });
  });

  it('exige sessão e perfil adequados', async () => {
    expect(() => service.requireUser()).toThrowError(AuthError, 'Sua sessão expirou. Entre novamente.');

    await service.signIn(DEMO_STOCKIST.email, DEMO_PASSWORD);
    expect(service.requireUser()).toEqual(DEMO_STOCKIST);
    expect(service.isAdmin()).toBeFalse();
    expect(() => service.requireAdmin()).toThrowError(AuthError, 'Apenas administradores podem realizar esta ação.');
  });
});
