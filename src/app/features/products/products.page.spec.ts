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
import { DEMO_STOCKIST } from '../../core/infra/in-memory/demo-data';
import { PromptOptions } from '../../core/services/dialog.service';
import { ValidationError } from '../../core/utils/app-errors';
import { ProductsPage } from './products.page';

describe('ProductsPage', () => {
  let fixture: ComponentFixture<ProductsPage>;
  let element: HTMLElement;
  let dialog: DialogStub;

  const rows = () => queryAll(element, '[data-testid="product-row"]');
  const row = (name: string) => rows().find((r) => textOf(r).includes(name))!;
  const button = (r: HTMLElement, label: string) =>
    queryAll<HTMLButtonElement>(r, 'button').find((b) => textOf(b) === label)!;
  const lastPrompt = <T>() => dialog.prompt.calls.mostRecent().args[0] as PromptOptions<T>;

  beforeEach(async () => {
    dialog = createDialogStub();
    TestBed.configureTestingModule({ imports: [ProductsPage], providers: provideTestApp(dialog) });
    await signInAs(DEMO_STOCKIST);
    fixture = TestBed.createComponent(ProductsPage);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('lista os produtos com indicador de estoque', () => {
    expect(rows().length).toBe(9);
    expect(textOf(row('Óleo de soja'))).toContain('Esgotado');
    expect(button(row('Óleo de soja'), 'Saída').disabled).toBeTrue();
    expect(button(row('Café torrado'), 'Saída').disabled).toBeFalse();
  });

  it('filtra pela busca', async () => {
    setInputValue(element.querySelector<HTMLInputElement>('input[type="search"]')!, 'cafe');
    await fixture.whenStable();
    expect(rows().map((r) => textOf(r.querySelector('td')!))).toEqual(['Café torrado 500g']);
  });

  it('mostra estado vazio quando nada é encontrado', async () => {
    setInputValue(element.querySelector<HTMLInputElement>('input[type="search"]')!, 'xyz');
    await fixture.whenStable();
    expect(textOf(element.querySelector('.empty-state')!)).toBe('Nenhum produto encontrado.');
  });

  it('registra entrada confirmada no diálogo', async () => {
    dialog.prompt.and.resolveTo(12);
    button(row('Café torrado'), 'Entrada').click();
    await fixture.whenStable();

    const prompt = lastPrompt<number>();
    expect(prompt.parse({ quantity: '3' })).toBe(3);
    expect(() => prompt.parse({ quantity: 'x' })).toThrowError(ValidationError);
    expect(dialog.success).toHaveBeenCalledWith('Entrada registrada com sucesso!');
    expect(textOf(row('Café torrado'))).toContain('60');
  });

  it('não faz nada se o diálogo for cancelado', async () => {
    button(row('Café torrado'), 'Entrada').click();
    await fixture.whenStable();
    expect(dialog.success).not.toHaveBeenCalled();
    expect(textOf(row('Café torrado'))).toContain('48');
  });

  it('valida saída no diálogo e registra com motivo', async () => {
    dialog.prompt.and.resolveTo({ quantity: 8, reason: 'Venda' });
    button(row('Café torrado'), 'Saída').click();
    await fixture.whenStable();

    const prompt = lastPrompt<{ quantity: number; reason: string }>();
    expect(() => prompt.parse({ quantity: '49', reason: 'x' })).toThrowError(ValidationError, /Estoque insuficiente/);
    expect(() => prompt.parse({ quantity: '1', reason: ' ' })).toThrowError(
      ValidationError,
      'Informe o motivo da saída.',
    );
    expect(prompt.parse({ quantity: '2', reason: ' Venda ' })).toEqual({ quantity: 2, reason: 'Venda' });

    expect(dialog.success).toHaveBeenCalledWith('Saída registrada com sucesso!');
    expect(textOf(row('Café torrado'))).toContain('40');
  });

  it('exibe erro quando a movimentação falha', async () => {
    dialog.prompt.and.resolveTo({ quantity: 999, reason: 'Venda' });
    button(row('Farinha'), 'Saída').click();
    await fixture.whenStable();

    expect(dialog.error).toHaveBeenCalled();
    expect(dialog.success).not.toHaveBeenCalled();
  });
});
