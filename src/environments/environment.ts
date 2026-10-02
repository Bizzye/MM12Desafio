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
    apiKey: 'AIzaSyC3vDT9zJvwGV_Vd17oU6elB5sxdyojhv0',
    authDomain: 'mm12desafio.firebaseapp.com',
    projectId: 'mm12desafio',
    storageBucket: 'mm12desafio.appspot.com',
    messagingSenderId: '120114148076',
    appId: '1:120114148076:web:93b384e538590b412b6bc9',
  },
};
