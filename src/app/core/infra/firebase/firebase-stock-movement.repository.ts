import { Injectable, inject } from '@angular/core';
import { collection, doc, limit, orderBy, query, runTransaction } from 'firebase/firestore';
import { Observable, map } from 'rxjs';

import { MovementRequest, StockMovement } from '../../models/stock-movement.model';
import { StockMovementRepository } from '../../repositories/stock-movement.repository';
import { StockError } from '../../utils/app-errors';
import { applyMovement } from '../../utils/stock.rules';
import { FIRESTORE } from './firebase.tokens';
import { withFirestoreErrors } from './firestore-error.mapper';
import { toHistoryDoc, toProduct, toStockMovement } from './firestore.mappers';
import { fromQuery } from './rx-firestore';

const HISTORY_LIMIT = 200;

@Injectable()
export class FirebaseStockMovementRepository extends StockMovementRepository {
  private readonly db = inject(FIRESTORE);

  watchAll(): Observable<StockMovement[]> {
    const history = query(collection(this.db, 'history'), orderBy('dataT', 'desc'), limit(HISTORY_LIMIT));
    return fromQuery(history).pipe(map((snapshot) => snapshot.docs.map(toStockMovement)));
  }

  register(request: MovementRequest): Promise<StockMovement> {
    return withFirestoreErrors(
      runTransaction(this.db, async (transaction) => {
        const productRef = doc(this.db, 'products', request.productId);
        const snapshot = await transaction.get(productRef);
        if (!snapshot.exists()) {
          throw new StockError('Produto não encontrado. Ele pode ter sido removido.');
        }
        const movementRef = doc(collection(this.db, 'history'));
        const movement = applyMovement(toProduct(snapshot), request, movementRef.id, Date.now());
        transaction.update(productRef, { qtd: movement.resultingQuantity });
        transaction.set(movementRef, toHistoryDoc(movement));
        return movement;
      }),
    );
  }
}
