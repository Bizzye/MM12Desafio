import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { provideTestApp, queryAll, setInputValue, textOf } from '../../../testing/test-helpers';
import { DEMO_ADMIN, DEMO_PASSWORD, DEMO_STOCKIST } from '../../core/infra/in-memory/demo-data';
import { DEMO_LOGIN_HINT } from '../../core/infra/demo-login-hint';
import { AuthService } from '../../core/services/auth.service';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let element: HTMLElement;

  const input = (id: string) => element.querySelector<HTMLInputElement>(`#${id}`)!;
  const submit = async () => {
    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  };
  const fill = (email: string, password: string) => {
    setInputValue(input('email'), email);
    setInputValue(input('password'), password);
  };

  async function setup(): Promise<void> {
    spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
    fixture = TestBed.createComponent(LoginPage);
    element = fixture.nativeElement;
    await fixture.whenStable();
  }

  beforeEach(() => TestBed.configureTestingModule({ imports: [LoginPage], providers: provideTestApp() }));

  it('exibe erro quando o formulário é inválido', async () => {
    await setup();
    fill('nao-e-email', '');
    await submit();

    expect(textOf(element.querySelector('[data-testid="login-error"]')!)).toBe('Informe um e-mail válido e a senha.');
    expect(input('email').getAttribute('aria-invalid')).toBe('true');
  });

  it('exibe erro genérico para credenciais inválidas e limpa a senha', async () => {
    await setup();
    fill(DEMO_ADMIN.email, 'errada');
    await submit();

    expect(textOf(element.querySelector('[data-testid="login-error"]')!)).toBe('E-mail ou senha inválidos.');
    expect(input('password').value).toBe('');
  });

  it('autentica e navega para o início', async () => {
    await setup();
    fill(DEMO_ADMIN.email, DEMO_PASSWORD);
    await submit();

    expect(TestBed.inject(AuthService).user()).toEqual(DEMO_ADMIN);
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledWith('/home', { replaceUrl: true });
    expect(element.querySelector('[data-testid="login-error"]')).toBeNull();
  });

  it('preenche as credenciais de demonstração', async () => {
    await setup();
    const buttons = queryAll<HTMLButtonElement>(element, '[data-testid="demo-accounts"] button');
    expect(buttons.map((b) => textOf(b))).toEqual(['Administrador', 'Estoquista']);

    buttons[1].click();
    await fixture.whenStable();

    expect(input('email').value).toBe(DEMO_STOCKIST.email);
    expect(input('password').value).toBe(DEMO_PASSWORD);
  });

  it('não exibe contas de demonstração em produção', async () => {
    TestBed.overrideProvider(DEMO_LOGIN_HINT, { useValue: null });
    await setup();
    expect(element.querySelector('[data-testid="demo-accounts"]')).toBeNull();
  });
});
