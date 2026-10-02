import { Observable } from 'rxjs';

import { AppUser } from '../models/app-user.model';

/**
 * Porta de autenticação (Repository pattern). Implementações: Firebase e em memória (demo/testes).
 * Classes abstratas servem como token de DI e contrato ao mesmo tempo.
 */
export abstract class AuthRepository {
  /** Emite o usuário autenticado (com perfil) ou `null`; emite imediatamente após a sessão ser resolvida. */
  abstract readonly user$: Observable<AppUser | null>;

  abstract signIn(email: string, password: string): Promise<void>;

  abstract signOut(): Promise<void>;
}
