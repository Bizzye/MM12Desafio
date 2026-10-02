import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { MovementRequest, StockMovement } from '../../models/stock-movement.model';
import { StockMovementRepository } from '../../repositories/stock-movement.repository';
import { StockError } from '../../utils/app-errors';
import { applyMovement } from '../../utils/stock.rules';
import { InMemoryStore } from './in-memory.store';

@Injectable()
export class InMemoryStockMovementRepository extends StockMovementRepository {
  private readonly store = inject(InMemoryStore);

  watchAll(): Observable<StockMovement[]> {
    return this.store.movements.pipe(map((movements) => [...movements].sort((a, b) => b.createdAt - a.createdAt)));
  }

  async register(request: MovementRequest): Promise<StockMovement> {
    const product = this.store.products.value.find((p) => p.id === request.productId);
    if (!product) {
      throw new StockError('Produto não encontrado. Ele pode ter sido removido.');
    }
    const movement = applyMovement(product, request, crypto.randomUUID(), Date.now());
    this.store.products.next(
      this.store.products.value.map((p) => (p.id === product.id ? { ...p, quantity: movement.resultingQuantity } : p)),
    );
    this.store.movements.next([movement, ...this.store.movements.value]);
    return movement;
  }
}
