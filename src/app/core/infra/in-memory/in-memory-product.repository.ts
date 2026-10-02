import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { NewProduct, Product } from '../../models/product.model';
import { ProductRepository } from '../../repositories/product.repository';
import { AppError } from '../../utils/app-errors';
import { InMemoryStore } from './in-memory.store';

const byName = (a: Product, b: Product) => a.name.localeCompare(b.name, 'pt-BR');

@Injectable()
export class InMemoryProductRepository extends ProductRepository {
  private readonly store = inject(InMemoryStore);

  watchAll(): Observable<Product[]> {
    return this.store.products.pipe(map((products) => [...products].sort(byName)));
  }

  async create(product: NewProduct): Promise<void> {
    const created: Product = { id: crypto.randomUUID(), createdAt: Date.now(), ...product };
    this.store.products.next([...this.store.products.value, created]);
  }

  async rename(id: string, name: string): Promise<void> {
    this.assertExists(id);
    this.store.products.next(this.store.products.value.map((p) => (p.id === id ? { ...p, name } : p)));
  }

  async remove(id: string): Promise<void> {
    this.assertExists(id);
    this.store.products.next(this.store.products.value.filter((p) => p.id !== id));
  }

  private assertExists(id: string): void {
    if (!this.store.products.value.some((p) => p.id === id)) {
      throw new AppError('Produto não encontrado.');
    }
  }
}
