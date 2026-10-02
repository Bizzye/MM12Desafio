import { EnvironmentProviders } from '@angular/core';

import { provideInMemoryDataAccess } from './in-memory/in-memory.providers';

/** Substitui `data-access.providers.ts` no build `demo` — nenhum código Firebase entra no bundle. */
export function provideDataAccess(): EnvironmentProviders {
  return provideInMemoryDataAccess();
}
