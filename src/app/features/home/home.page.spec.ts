import { TestBed } from '@angular/core/testing';

import { provideTestApp, queryAll, signInAs, textOf } from '../../../testing/test-helpers';
import { DEMO_ADMIN, DEMO_STOCKIST } from '../../core/infra/in-memory/demo-data';
import { HomePage } from './home.page';

describe('HomePage', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HomePage], providers: provideTestApp() }));

  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(HomePage);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('saúda o usuário e resume o estoque', async () => {
    await signInAs(DEMO_STOCKIST);
    const element = await render();

    expect(textOf(element.querySelector('h1')!)).toContain('Olá, Bruno Lima');
    expect(textOf(element.querySelector('[data-testid="user-role"]')!)).toBe('Estoquista');
    expect(textOf(element.querySelector('[data-testid="stat-products"]')!)).toBe('9');
    expect(textOf(element.querySelector('[data-testid="stat-out-of-stock"]')!)).toBe('1');
  });

  it('mostra o atalho de administração apenas para administradores', async () => {
    await signInAs(DEMO_STOCKIST);
    let titles = queryAll(await render(), '.shortcut h2').map(textOf);
    expect(titles).toEqual(['Produtos', 'Histórico']);

    await signInAs(DEMO_ADMIN);
    titles = queryAll(await render(), '.shortcut h2').map(textOf);
    expect(titles).toEqual(['Produtos', 'Histórico', 'Administração']);
  });
});
