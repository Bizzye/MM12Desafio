/** Normaliza texto para busca: minúsculas, sem acentos e sem espaços nas pontas. */
export function normalizeForSearch(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/** Filtra itens cujo texto (obtido por `pick`) contém o termo, ignorando acentos e caixa. */
export function filterBySearch<T>(items: readonly T[], term: string, pick: (item: T) => string): readonly T[] {
  const query = normalizeForSearch(term);
  return query ? items.filter((item) => normalizeForSearch(pick(item)).includes(query)) : items;
}
