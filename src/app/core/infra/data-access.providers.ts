import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { AuthRepository } from '../repositories/auth.repository';
import { ProductRepository } from '../repositories/product.repository';
import { StockMovementRepository } from '../repositories/stock-movement.repository';
import { FirebaseAuthRepository } from './firebase/firebase-auth.repository';
import { FirebaseProductRepository } from './firebase/firebase-product.repository';
import { FirebaseStockMovementRepository } from './firebase/firebase-stock-movement.repository';

/**
 * Liga as portas (repositórios abstratos) às implementações Firebase.
 * No build `demo` este arquivo é substituído por `data-access.providers.demo.ts` (ver angular.json).
 */
export function provideDataAccess(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: AuthRepository, useClass: FirebaseAuthRepository },
    { provide: ProductRepository, useClass: FirebaseProductRepository },
    { provide: StockMovementRepository, useClass: FirebaseStockMovementRepository },
  ]);
}
