import { FirebaseError } from 'firebase/app';
import { DocumentData, DocumentSnapshot } from 'firebase/firestore';

import { StockMovement } from '../../models/stock-movement.model';
import { AppError } from '../../utils/app-errors';
import { mapFirestoreError, withFirestoreErrors } from './firestore-error.mapper';
import { toAppUser, toHistoryDoc, toProduct, toStockMovement } from './firestore.mappers';

function snapshot(id: string, data: DocumentData | undefined): DocumentSnapshot<DocumentData> {
  return { id, data: () => data } as unknown as DocumentSnapshot<DocumentData>;
}

describe('firestore.mappers', () => {
  it('converte produtos do schema legado', () => {
    expect(toProduct(snapshot('p1', { id: 'antigo', nome: 'Café', qtd: '12', dataC: 100 }))).toEqual({
      id: 'p1',
      name: 'Café',
      quantity: 12,
      createdAt: 100,
    });
  });

  it('usa valores seguros quando campos estão ausentes ou inválidos', () => {
    expect(toProduct(snapshot('p1', undefined))).toEqual({ id: 'p1', name: '', quantity: 0, createdAt: 0 });
    expect(toProduct(snapshot('p1', { nome: 'X', qtd: 'abc' })).quantity).toBe(0);
  });

  it('converte o histórico legado e faz o caminho inverso', () => {
    const doc = {
      id: 'm1',
      dataT: 500,
      tipoT: 'Saída',
      uid: 'u1',
      desc: 'Venda',
      itemT: { id: 'p1', nome: 'Café', qtdpassado: 10, qtdMovimentado: 3, qtd: 7 },
    };
    const movement = toStockMovement(snapshot('m1', doc));

    expect(movement).toEqual({
      id: 'm1',
      type: 'exit',
      productId: 'p1',
      productName: 'Café',
      previousQuantity: 10,
      movedQuantity: 3,
      resultingQuantity: 7,
      reason: 'Venda',
      userId: 'u1',
      createdAt: 500,
    });
    expect(toHistoryDoc(movement)).toEqual(doc as ReturnType<typeof toHistoryDoc>);
  });

  it('omite o motivo em entradas', () => {
    const entry: StockMovement = {
      id: 'm2',
      type: 'entry',
      productId: 'p1',
      productName: 'Café',
      previousQuantity: 1,
      movedQuantity: 1,
      resultingQuantity: 2,
      reason: null,
      userId: 'u1',
      createdAt: 1,
    };
    const doc = toHistoryDoc(entry);
    expect(doc.tipoT).toBe('Entrada');
    expect('desc' in doc).toBeFalse();
    expect(toStockMovement(snapshot('m2', {})).type).toBe('entry');
  });

  it('mapeia o perfil do usuário', () => {
    expect(toAppUser('u1', 'a@b.com', { nome: 'Ana', categoria: 'adm' })).toEqual({
      uid: 'u1',
      email: 'a@b.com',
      name: 'Ana',
      role: 'admin',
    });
    expect(toAppUser('u2', 'b@b.com', undefined)).toEqual({
      uid: 'u2',
      email: 'b@b.com',
      name: 'b@b.com',
      role: 'stockist',
    });
  });
});

describe('firestore-error.mapper', () => {
  it('traduz permissão negada e indisponibilidade', () => {
    const denied = mapFirestoreError(new FirebaseError('permission-denied', 'raw')) as AppError;
    expect(denied).toBeInstanceOf(AppError);
    expect(denied.message).toBe('Você não tem permissão para realizar esta ação.');
    expect((mapFirestoreError(new FirebaseError('unavailable', 'raw')) as AppError).message).toContain('indisponível');
  });

  it('repassa outros erros sem alteração', () => {
    const domain = new AppError('x');
    const other = new FirebaseError('aborted', 'raw');
    const plain = new Error('y');
    expect(mapFirestoreError(domain)).toBe(domain);
    expect(mapFirestoreError(other)).toBe(other);
    expect(mapFirestoreError(plain)).toBe(plain);
  });

  it('converte rejeições de promises', async () => {
    await expectAsync(
      withFirestoreErrors(Promise.reject(new FirebaseError('permission-denied', 'raw'))),
    ).toBeRejectedWithError(AppError, 'Você não tem permissão para realizar esta ação.');
    await expectAsync(withFirestoreErrors(Promise.resolve(42))).toBeResolvedTo(42);
  });
});
