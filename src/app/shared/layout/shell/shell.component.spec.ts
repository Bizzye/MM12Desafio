import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import {
  DialogStub,
  createDialogStub,
  provideTestApp,
  queryAll,
  signInAs,
  textOf,
} from '../../../../testing/test-helpers';
import { DEMO_ADMIN, DEMO_STOCKIST } from '../../../core/infra/in-memory/demo-data';
import { AuthService } from '../../../core/services/auth.service';
import { ShellComponent } from './shell.component';

describe('ShellComponent', () => {
  let dialog: DialogStub;
  let navigate: jasmine.Spy<Router['navigateByUrl']>;

  beforeEach(() => {
    dialog = createDialogStub();
    TestBed.configureTestingModule({ imports: [ShellComponent], providers: provideTestApp(dialog) });
    navigate = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
  });

  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(ShellComponent);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('mostra o usuário logado e o menu do perfil', async () => {
    await signInAs(DEMO_ADMIN);
    const element = await render();

    expect(textOf(element.querySelector('.user__name')!)).toBe('Ana Souza');
    expect(textOf(element.querySelector('.user__role')!)).toBe('Administrador');
    expect(queryAll(element, 'nav a').length).toBe(4);
  });

  it('esconde a administração para estoquistas', async () => {
    await signInAs(DEMO_STOCKIST);
    const element = await render();

    expect(queryAll(element, 'nav a').map((a) => a.getAttribute('aria-label'))).toEqual([
      'Início',
      'Produtos',
      'Histórico',
    ]);
  });

  it('faz logout pelo menu', async () => {
    await signInAs(DEMO_STOCKIST);
    const element = await render();

    element.querySelector<HTMLButtonElement>('.side-menu__logout')!.click();
    await new Promise((resolve) => setTimeout(resolve));

    expect(TestBed.inject(AuthService).user()).toBeNull();
    expect(navigate).toHaveBeenCalledWith('/login', { replaceUrl: true });
  });

  it('exibe erro se o logout falhar', async () => {
    await signInAs(DEMO_STOCKIST);
    spyOn(TestBed.inject(AuthService), 'signOut').and.rejectWith(new Error('offline'));
    const element = await render();

    element.querySelector<HTMLButtonElement>('.side-menu__logout')!.click();
    await new Promise((resolve) => setTimeout(resolve));

    expect(dialog.error).toHaveBeenCalled();
  });
});
