import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideTestApp, queryAll, setInputValue, signInAs, textOf } from '../../../testing/test-helpers';
import { DEMO_STOCKIST } from '../../core/infra/in-memory/demo-data';
import { HistoryPage } from './history.page';

describe('HistoryPage', () => {
  let fixture: ComponentFixture<HistoryPage>;
  let element: HTMLElement;

  const rows = () => queryAll(element, '[data-testid="movement-row"]');

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [HistoryPage], providers: provideTestApp() });
    await signInAs(DEMO_STOCKIST);
    fixture = TestBed.createComponent(HistoryPage);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('lista as movimentações da mais recente para a mais antiga', () => {
    expect(rows().length).toBe(7);
    const first = textOf(rows()[0]);
    expect(first).toContain('Café torrado 500g');
    expect(first).toContain('Saída');
    expect(first).toContain('−12');
    expect(first).toContain('Venda balcão');
  });

  it('filtra por tipo', async () => {
    setInputValue(element.querySelector<HTMLSelectElement>('#movement-type')!, 'entry');
    await fixture.whenStable();
    expect(rows().length).toBe(3);
    expect(rows().every((r) => textOf(r).includes('Entrada'))).toBeTrue();
  });

  it('filtra por produto e mostra estado vazio', async () => {
    const search = element.querySelector<HTMLInputElement>('input[type="search"]')!;
    setInputValue(search, 'leite');
    await fixture.whenStable();
    expect(rows().length).toBe(1);

    setInputValue(search, 'inexistente');
    await fixture.whenStable();
    expect(textOf(element.querySelector('.empty-state')!)).toBe('Nenhuma movimentação encontrada.');
  });
});
