import { Injectable, inject } from '@angular/core';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { Observable, map, of, shareReplay, switchMap } from 'rxjs';

import { AppUser } from '../../models/app-user.model';
import { AuthRepository } from '../../repositories/auth.repository';
import { mapAuthError } from '../../utils/auth-error.mapper';
import { FIREBASE_AUTH, FIRESTORE } from './firebase.tokens';
import { toAppUser } from './firestore.mappers';
import { fromDocument } from './rx-firestore';

@Injectable()
export class FirebaseAuthRepository extends AuthRepository {
  private readonly auth = inject(FIREBASE_AUTH);
  private readonly db = inject(FIRESTORE);

  readonly user$: Observable<AppUser | null> = new Observable<User | null>((subscriber) =>
    onAuthStateChanged(
      this.auth,
      (user) => subscriber.next(user),
      (error) => subscriber.error(error),
    ),
  ).pipe(
    switchMap((user) =>
      user
        ? fromDocument(doc(this.db, 'users', user.uid)).pipe(
            map((snapshot) => toAppUser(user.uid, user.email ?? '', snapshot.data())),
          )
        : of(null),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  async signIn(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw mapAuthError(error);
    }
  }

  signOut(): Promise<void> {
    return signOut(this.auth);
  }
}
