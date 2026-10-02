import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';

import { Product } from '../models/product.model';
import { MovementType, StockMovement } from '../models/stock-movement.model';
import { ProductRepository } from '../repositories/product.repository';
import { StockMovementRepository } from '../repositories/stock-movement.repository';
import { ValidationError } from '../utils/app-errors';
import { normalizeProductName, parseQuantity } from '../utils/stock.rules';
import { AuthService } from './auth.service';

/**
 * Facade dos casos de uso de estoque. Concentra validação e autorização no cliente;
 * a autoridade final continua sendo das regras do Firestore (defesa em profundidade).
 */
@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly productRepository = inject(ProductRepository);
  private readonly movementRepository = inject(StockMovementRepository);
  private readonly auth = inject(AuthService);

  readonly products$: Observable<Product[]> = this.productRepository.watchAll().pipe(catchError(logAndFallback));
  readonly movements$: Observable<StockMovement[]> = this.movementRepository
    .watchAll()
    .pipe(catchError(logAndFallback));

  async addProduct(name: unknown, initialQuantity: unknown): Promise<void> {
    this.auth.requireAdmin();
    await this.productRepository.create({
      name: normalizeProductName(name),
      quantity: parseQuantity(initialQuantity, { allowZero: true }),
    });
  }

  async renameProduct(id: string, name: unknown): Promise<void> {
    this.auth.requireAdmin();
    await this.productRepository.rename(id, normalizeProductName(name));
  }

  async removeProduct(id: string): Promise<void> {
    this.auth.requireAdmin();
    await this.productRepository.remove(id);
  }

  registerEntry(productId: string, quantity: unknown): Promise<StockMovement> {
    return this.register('entry', productId, quantity, null);
  }

  async registerExit(productId: string, quantity: unknown, reason: unknown): Promise<StockMovement> {
    const trimmedReason = String(reason ?? '').trim();
    if (!trimmedReason) {
      throw new ValidationError('Informe o motivo da saída.');
    }
    return this.register('exit', productId, quantity, trimmedReason);
  }

  private async register(
    type: MovementType,
    productId: string,
    quantity: unknown,
    reason: string | null,
  ): Promise<StockMovement> {
    const user = this.auth.requireUser();
    return this.movementRepository.register({
      type,
      productId,
      quantity: parseQuantity(quantity),
      reason,
      userId: user.uid,
    });
  }
}

function logAndFallback(error: unknown): Observable<never[]> {
  console.error(error);
  return of([]);
}
