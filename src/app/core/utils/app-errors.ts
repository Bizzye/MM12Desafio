/** Erro de domínio com mensagem segura para exibir ao usuário. */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class StockError extends AppError {}

export class AuthError extends AppError {}

export class ValidationError extends AppError {}

const GENERIC_ERROR = 'Algo deu errado. Tente novamente em instantes.';

/** Converte qualquer erro em uma mensagem amigável, sem vazar detalhes internos. */
export function toUserMessage(error: unknown): string {
  return error instanceof AppError ? error.message : GENERIC_ERROR;
}
