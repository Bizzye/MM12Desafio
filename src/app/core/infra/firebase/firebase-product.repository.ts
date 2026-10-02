import { Injectable, inject } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, orderBy, query, updateDoc } from 'firebase/firestore';
import { Observable, map } from 'rxjs';

import { NewProduct, Product } from '../../models/product.model';
import { ProductRepository } from '../../repositories/product.repository';
import { FIRESTORE } from './firebase.tokens';
import { withFirestoreErrors } from './firestore-error.mapper';
import { ProductDoc, toProduct } from './firestore.mappers';
import { fromQuery } from './rx-firestore';

const COLLECTION = 'products';

@Injectable()
export class FirebaseProductRepository extends ProductRepository {
  private readonly db = inject(FIRESTORE);

  watchAll(): Observable<Product[]> {
    return fromQuery(query(collection(this.db, COLLECTION), orderBy('nome'))).pipe(
      map((snapshot) => snapshot.docs.map(toProduct)),
    );
  }

  async create(product: NewProduct): Promise<void> {
    const data: ProductDoc = { nome: product.name, qtd: product.quantity, dataC: Date.now() };
    await withFirestoreErrors(addDoc(collection(this.db, COLLECTION), data));
  }

  rename(id: string, name: string): Promise<void> {
    return withFirestoreErrors(updateDoc(doc(this.db, COLLECTION, id), { nome: name }));
  }

  remove(id: string): Promise<void> {
    return withFirestoreErrors(deleteDoc(doc(this.db, COLLECTION, id)));
  }
}
