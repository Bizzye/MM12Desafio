import { InjectionToken } from '@angular/core';

export interface DemoLoginHint {
  readonly password: string;
  readonly accounts: readonly { readonly label: string; readonly email: string }[];
}

/**
 * Contas de demonstração exibidas na tela de login. Só é provido pelos repositórios
 * em memória, então nenhuma credencial de demo entra no bundle de produção.
 */
export const DEMO_LOGIN_HINT = new InjectionToken<DemoLoginHint | null>('DEMO_LOGIN_HINT', {
  providedIn: 'root',
  factory: () => null,
});
