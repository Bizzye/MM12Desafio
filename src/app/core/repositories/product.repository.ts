import { Observable } from 'rxjs';

import { NewProduct, Product } from '../models/product.model';

export abstract class ProductRepository {
  /** Lista de produtos em tempo real, ordenada por nome. */
  abstract watchAll(): Observable<Product[]>;

  abstract create(product: NewProduct): Promise<void>;

  abstract rename(id: string, name: string): Promise<void>;

  abstract remove(id: string): Promise<void>;
}
