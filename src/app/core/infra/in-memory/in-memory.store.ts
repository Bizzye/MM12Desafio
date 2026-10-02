import { Injectable, InjectionToken, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Product } from '../../models/product.model';
import { StockMovement } from '../../models/stock-movement.model';
import { DemoAccount, DemoSeed, createDemoSeed } from './demo-data';

export const DEMO_SEED = new InjectionToken<DemoSeed>('DEMO_SEED', {
  providedIn: 'root',
  factory: () => createDemoSeed(),
});

export type SessionStorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export const DEMO_SESSION_STORAGE = new InjectionToken<SessionStorageLike>('DEMO_SESSION_STORAGE', {
  providedIn: 'root',
  factory: () => globalThis.sessionStorage,
});

/** "Banco de dados" em memória compartilhado pelos repositórios do modo demo. */
@Injectable({ providedIn: 'root' })
export class InMemoryStore {
  private readonly seed = inject(DEMO_SEED);

  readonly accounts: readonly DemoAccount[] = this.seed.accounts;
  readonly products = new BehaviorSubject<readonly Product[]>(structuredClone(this.seed.products));
  readonly movements = new BehaviorSubject<readonly StockMovement[]>(structuredClone(this.seed.movements));
}
