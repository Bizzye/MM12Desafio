import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  DialogStub,
  createDialogStub,
  provideTestApp,
  queryAll,
  setInputValue,
  signInAs,
  textOf,
} from '../../../testing/test-helpers';
import { DEMO_ADMIN, DEMO_STOCKIST } from '../../core/infra/in-memory/demo-data';
import { AdminPage } from './admin.page';

describe('AdminPage', () => {
  let fixture: ComponentFixture<AdminPage>;
  let element: HTMLElement;
  let dialog: DialogStub;

  const rows = () => queryAll(element, '[data-testid="admin-row"]');
  const row = (name: string) => rows().find((r) => textOf(r).includes(name));
  const buttonByLabel = (root: HTMLElement, label: string) =>
    queryAll<HTMLButtonElement>(root, 'button').find((b) => b.getAttribute('aria-label') === label)!;
  const stable = () => fixture.whenStable();

  async function setup(user = DEMO_ADMIN): Promise<void> {
    dialog = createDialogStub();
    TestBed.configureTestingModule({ imports: [AdminPage], providers: provideTestApp(dialog) });
    await signInAs(user);
    fixture = TestBed.createComponent(AdminPage);
    element = fixture.nativeElement;
    await stable();
  }

  describe('cadastro', () => {
    beforeEach(() => setup());

    it('desabilita o botão enquanto o formulário é inválido', () => {
      expect(element.querySelector<HTMLButtonElement>('form button[type="submit"]')!.disabled).toBeTrue();
    });

    it('cadastra um produto e limpa o formulário', async () => {
      setInputValue(element.querySelector<HTMLInputElement>('#product-name')!, 'Chá verde');
      setInputValue(element.querySelector<HTMLInputElement>('#product-quantity')!, '30');
      await stable();
      element.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
      await stable();

      expect(dialog.success).toHaveBeenCalledWith('"Chá verde" cadastrado!');
      expect(textOf(row('Chá verde')!)).toContain('30');
      expect(element.querySelector<HTMLInputElement>('#product-name')!.value).toBe('');
    });
  });

  describe('edição e remoção', () => {
    beforeEach(() => setup());

    it('edita apenas a linha selecionada e salva o novo nome', async () => {
      buttonByLabel(row('Arroz')!, 'Editar Arroz tipo 1 5kg').click();
      await stable();

      const inputs = queryAll<HTMLInputElement>(element, '.input--inline');
      expect(inputs.length).toBe(1);

      setInputValue(inputs[0], 'Arroz integral 5kg');
      await stable();
      buttonByLabel(element, 'Salvar').click();
      await stable();

      expect(row('Arroz integral 5kg')).toBeDefined();
      expect(dialog.success).toHaveBeenCalledWith('Produto renomeado!');
      expect(element.querySelector('.input--inline')).toBeNull();
    });

    it('cancela a edição sem alterar o nome', async () => {
      buttonByLabel(row('Arroz')!, 'Editar Arroz tipo 1 5kg').click();
      await stable();
      setInputValue(element.querySelector<HTMLInputElement>('.input--inline')!, 'Outro nome');
      buttonByLabel(element, 'Cancelar').click();
      await stable();

      expect(row('Arroz tipo 1 5kg')).toBeDefined();
      expect(row('Outro nome')).toBeUndefined();
    });

    it('mostra erro ao salvar nome inválido', async () => {
      buttonByLabel(row('Arroz')!, 'Editar Arroz tipo 1 5kg').click();
      await stable();
      setInputValue(element.querySelector<HTMLInputElement>('.input--inline')!, '   ');
      buttonByLabel(element, 'Salvar').click();
      await stable();

      expect(dialog.error).toHaveBeenCalled();
      expect(element.querySelector('.input--inline')).not.toBeNull();
    });

    it('remove após confirmação', async () => {
      buttonByLabel(row('Arroz')!, 'Remover Arroz tipo 1 5kg').click();
      await stable();

      expect(dialog.confirm).toHaveBeenCalled();
      expect(row('Arroz')).toBeUndefined();
      expect(dialog.success).toHaveBeenCalledWith('Produto removido.');
    });

    it('mantém o produto se a remoção não for confirmada', async () => {
      dialog.confirm.and.resolveTo(false);
      buttonByLabel(row('Arroz')!, 'Remover Arroz tipo 1 5kg').click();
      await stable();

      expect(row('Arroz')).toBeDefined();
    });
  });

  it('exibe erro se um não-administrador tentar cadastrar', async () => {
    await setup(DEMO_STOCKIST);
    setInputValue(element.querySelector<HTMLInputElement>('#product-name')!, 'Chá');
    await stable();
    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await stable();

    expect(dialog.error).toHaveBeenCalled();
    expect(row('Chá')).toBeUndefined();
  });
});
