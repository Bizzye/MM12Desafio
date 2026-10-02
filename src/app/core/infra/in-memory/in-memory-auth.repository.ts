import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AppUser } from '../../models/app-user.model';
import { AuthRepository } from '../../repositories/auth.repository';
import { mapAuthError } from '../../utils/auth-error.mapper';
import { DEMO_SESSION_STORAGE, InMemoryStore } from './in-memory.store';

const SESSION_KEY = 'mm12-demo-session';

@Injectable()
export class InMemoryAuthRepository extends AuthRepository {
  private readonly store = inject(InMemoryStore);
  private readonly storage = inject(DEMO_SESSION_STORAGE);
  private readonly session = new BehaviorSubject<AppUser | null>(this.restoreSession());

  readonly user$ = this.session.asObservable();

  async signIn(email: string, password: string): Promise<void> {
    const account = this.store.accounts.find((candidate) => candidate.user.email === email.toLowerCase());
    if (!account || account.password !== password) {
      throw mapAuthError({ code: 'auth/invalid-credential' });
    }
    this.storage.setItem(SESSION_KEY, account.user.uid);
    this.session.next(account.user);
  }

  async signOut(): Promise<void> {
    this.storage.removeItem(SESSION_KEY);
    this.session.next(null);
  }

  private restoreSession(): AppUser | null {
    const uid = this.storage.getItem(SESSION_KEY);
    return this.store.accounts.find((account) => account.user.uid === uid)?.user ?? null;
  }
}
