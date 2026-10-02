import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';

import { AppUser } from '../models/app-user.model';
import { AuthService } from '../services/auth.service';

/** Fábrica de guards: libera a rota quando `allow(user)` é verdadeiro; senão redireciona. */
function guard(allow: (user: AppUser | null) => boolean, redirectTo: string): CanActivateFn {
  return () => {
    const router = inject(Router);
    return inject(AuthService).user$.pipe(
      take(1),
      map((user) => allow(user) || router.createUrlTree([redirectTo])),
    );
  };
}

/** Rotas internas: exige sessão. */
export const authGuard = guard((user) => user !== null, '/login');

/** Tela de login: só para quem não está autenticado. */
export const guestGuard = guard((user) => user === null, '/home');

/** Área administrativa: exige perfil admin (o backend também valida via firestore.rules). */
export const adminGuard = guard((user) => user?.role === 'admin', '/home');
