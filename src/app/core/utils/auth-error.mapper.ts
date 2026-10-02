import { AuthError } from './app-errors';

/**
 * Traduz códigos do Firebase Auth em mensagens para o usuário.
 *
 * "Usuário não encontrado" e "senha incorreta" retornam a MESMA mensagem de propósito:
 * mensagens diferentes permitem enumerar quais e-mails possuem conta.
 */
const MESSAGES: Readonly<Record<string, string>> = {
  'auth/invalid-credential': 'E-mail ou senha inválidos.',
  'auth/wrong-password': 'E-mail ou senha inválidos.',
  'auth/user-not-found': 'E-mail ou senha inválidos.',
  'auth/invalid-email': 'Informe um e-mail válido.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'auth/network-request-failed': 'Sem conexão com o servidor. Verifique sua internet.',
};

export function mapAuthError(error: unknown): AuthError {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  return new AuthError(MESSAGES[code] ?? 'Não foi possível entrar. Tente novamente.');
}
