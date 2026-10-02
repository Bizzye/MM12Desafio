import { AppError, AuthError, StockError, toUserMessage } from './app-errors';
import { mapAuthError } from './auth-error.mapper';

describe('app-errors', () => {
  it('expõe a mensagem de erros de domínio', () => {
    expect(toUserMessage(new StockError('Sem estoque'))).toBe('Sem estoque');
    expect(new StockError('x').name).toBe('StockError');
  });

  it('esconde detalhes de erros inesperados', () => {
    expect(toUserMessage(new Error('stack interna'))).toBe('Algo deu errado. Tente novamente em instantes.');
    expect(toUserMessage('falha')).toBe('Algo deu errado. Tente novamente em instantes.');
  });
});

describe('mapAuthError', () => {
  it('usa a mesma mensagem para usuário inexistente e senha errada (evita enumeração de contas)', () => {
    const notFound = mapAuthError({ code: 'auth/user-not-found' });
    const wrongPassword = mapAuthError({ code: 'auth/wrong-password' });
    const invalid = mapAuthError({ code: 'auth/invalid-credential' });

    expect(notFound).toBeInstanceOf(AuthError);
    expect(notFound.message).toBe('E-mail ou senha inválidos.');
    expect(wrongPassword.message).toBe(notFound.message);
    expect(invalid.message).toBe(notFound.message);
  });

  it('traduz códigos conhecidos', () => {
    expect(mapAuthError({ code: 'auth/too-many-requests' }).message).toContain('Muitas tentativas');
    expect(mapAuthError({ code: 'auth/network-request-failed' }).message).toContain('Sem conexão');
  });

  it('usa mensagem genérica para erros desconhecidos', () => {
    expect(mapAuthError({ code: 'auth/qualquer' }).message).toBe('Não foi possível entrar. Tente novamente.');
    expect(mapAuthError(new Error('x')).message).toBe('Não foi possível entrar. Tente novamente.');
    expect(mapAuthError(null)).toBeInstanceOf(AppError);
  });
});
