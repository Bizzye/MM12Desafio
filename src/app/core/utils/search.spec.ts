import { filterBySearch, normalizeForSearch } from './search';

describe('search', () => {
  it('normaliza acentos, caixa e espaços', () => {
    expect(normalizeForSearch('  Feijão AÇÚCAR ')).toBe('feijao acucar');
    expect(normalizeForSearch(null)).toBe('');
  });

  describe('filterBySearch', () => {
    const items = [{ name: 'Feijão carioca' }, { name: 'Açúcar refinado' }, { name: 'Café' }];

    it('retorna a mesma lista quando não há termo', () => {
      expect(filterBySearch(items, '  ', (i) => i.name)).toBe(items);
    });

    it('encontra itens ignorando acentos e maiúsculas', () => {
      expect(filterBySearch(items, 'FEIJAO', (i) => i.name)).toEqual([{ name: 'Feijão carioca' }]);
      expect(filterBySearch(items, 'acu', (i) => i.name)).toEqual([{ name: 'Açúcar refinado' }]);
    });

    it('retorna vazio quando nada corresponde', () => {
      expect(filterBySearch(items, 'arroz', (i) => i.name)).toEqual([]);
    });
  });
});
