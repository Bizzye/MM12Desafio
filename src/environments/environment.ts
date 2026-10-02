import { Environment } from './environment.model';

/**
 * Configuração do app para o backend Firebase real.
 *
 * As chaves do SDK web do Firebase são identificadores públicos (vão para o bundle
 * de qualquer forma) — a proteção dos dados é feita pelas regras em `firestore.rules`
 * e pelas restrições de domínio da API key no Google Cloud Console.
 */
export const environment: Environment = {
  demoMode: false,
  firebase: {
    apiKey: 'AIzaSyBoj6yVGOrToe3hgKIeOUvDBDjF2y80ZI8',
    authDomain: 'desafio564.firebaseapp.com',
    projectId: 'desafio564',
    storageBucket: 'desafio564.firebasestorage.app',
    messagingSenderId: '448865144404',
    appId: '1:448865144404:web:6f7ad6f1d7268084c127c1',
  },
};
