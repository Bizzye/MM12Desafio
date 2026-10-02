import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';

import { AppUser } from '../models/app-user.model';
import { AuthRepository } from '../repositories/auth.repository';
import { AuthError, ValidationError } from '../utils/app-errors';

/** Facade de sessão: expõe o usuário como signal e centraliza login/logout + navegação. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly repository = inject(AuthRepository);
  private readonly router = inject(Router);

  readonly user$ = this.repository.user$;
  readonly user = toSignal(this.user$, { initialValue: null });
  readonly isAdmin = computed(() => this.user()?.role === 'admin');

  async signIn(email: string, password: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      throw new ValidationError('Informe e-mail e senha.');
    }
    await this.repository.signIn(normalizedEmail, password);
    // Aguarda o perfil carregar antes de navegar, para os guards já enxergarem o usuário.
    await firstValueFrom(this.user$.pipe(filter((user) => user !== null)));
    await this.router.navigateByUrl('/home', { replaceUrl: true });
  }

  async signOut(): Promise<void> {
    await this.repository.signOut();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  /** Usuário atual ou erro — para operações que exigem sessão ativa. */
  requireUser(): AppUser {
    const user = this.user();
    if (!user) {
      throw new AuthError('Sua sessão expirou. Entre novamente.');
    }
    return user;
  }

  requireAdmin(): AppUser {
    const user = this.requireUser();
    if (user.role !== 'admin') {
      throw new AuthError('Apenas administradores podem realizar esta ação.');
    }
    return user;
  }
}
