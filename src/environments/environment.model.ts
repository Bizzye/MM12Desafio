import type { FirebaseOptions } from 'firebase/app';

export interface Environment {
  /** Quando `true`, o app usa repositórios em memória com dados fictícios. */
  readonly demoMode: boolean;
  readonly firebase: FirebaseOptions | null;
}
