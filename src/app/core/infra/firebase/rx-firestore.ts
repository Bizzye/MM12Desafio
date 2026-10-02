import { DocumentReference, DocumentSnapshot, Query, QuerySnapshot, onSnapshot } from 'firebase/firestore';
import { Observable } from 'rxjs';

/** Adapta listeners em tempo real do Firestore para Observables (o unsubscribe encerra o listener). */
export function fromQuery<T>(query: Query<T>): Observable<QuerySnapshot<T>> {
  return new Observable((subscriber) =>
    onSnapshot(
      query,
      (snapshot) => subscriber.next(snapshot),
      (error) => subscriber.error(error),
    ),
  );
}

export function fromDocument<T>(ref: DocumentReference<T>): Observable<DocumentSnapshot<T>> {
  return new Observable((subscriber) =>
    onSnapshot(
      ref,
      (snapshot) => subscriber.next(snapshot),
      (error) => subscriber.error(error),
    ),
  );
}
