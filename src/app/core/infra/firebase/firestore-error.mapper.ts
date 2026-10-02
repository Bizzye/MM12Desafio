import { FirebaseError } from 'firebase/app';

import { AppError } from '../../utils/app-errors';

export function mapFirestoreError(error: unknown): unknown {
  if (error instanceof AppError || !(error instanceof FirebaseError)) {
    return error;
  }
  switch (error.code) {
    case 'permission-denied':
      return new AppError('Você não tem permissão para realizar esta ação.');
    case 'unavailable':
      return new AppError('Servidor indisponível. Verifique sua conexão.');
    default:
      return error;
  }
}

/** Repassa a Promise convertendo erros do Firestore em erros de domínio. */
export function withFirestoreErrors<T>(promise: Promise<T>): Promise<T> {
  return promise.catch((error: unknown) => {
    throw mapFirestoreError(error);
  });
}
