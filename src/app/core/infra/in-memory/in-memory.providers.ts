import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { AuthRepository } from '../../repositories/auth.repository';
import { ProductRepository } from '../../repositories/product.repository';
import { StockMovementRepository } from '../../repositories/stock-movement.repository';
import { DEMO_LOGIN_HINT } from '../demo-login-hint';
import { DEMO_ADMIN, DEMO_PASSWORD, DEMO_STOCKIST } from './demo-data';
import { InMemoryAuthRepository } from './in-memory-auth.repository';
import { InMemoryProductRepository } from './in-memory-product.repository';
import { InMemoryStockMovementRepository } from './in-memory-stock-movement.repository';

/** Repositórios em memória — usados no modo demo e nos testes unitários. */
export function provideInMemoryDataAccess(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: AuthRepository, useClass: InMemoryAuthRepository },
    { provide: ProductRepository, useClass: InMemoryProductRepository },
    { provide: StockMovementRepository, useClass: InMemoryStockMovementRepository },
    {
      provide: DEMO_LOGIN_HINT,
      useValue: {
        password: DEMO_PASSWORD,
        accounts: [
          { label: 'Administrador', email: DEMO_ADMIN.email },
          { label: 'Estoquista', email: DEMO_STOCKIST.email },
        ],
      },
    },
  ]);
}
