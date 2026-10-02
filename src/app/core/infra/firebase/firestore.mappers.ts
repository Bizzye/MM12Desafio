import { DocumentData, DocumentSnapshot } from 'firebase/firestore';

import { AppUser } from '../../models/app-user.model';
import { Product } from '../../models/product.model';
import { StockMovement } from '../../models/stock-movement.model';

/**
 * Data Mappers entre o schema legado do Firestore (campos em português, criados na v1)
 * e o modelo de domínio da aplicação. Mantém compatibilidade com os dados já existentes.
 */

export interface ProductDoc {
  nome: string;
  qtd: number;
  dataC: number;
}

export interface HistoryDoc {
  id: string;
  dataT: number;
  tipoT: 'Entrada' | 'Saída';
  uid: string;
  desc?: string;
  itemT: {
    id: string;
    nome: string;
    qtdpassado: number;
    qtdMovimentado: number;
    qtd: number;
  };
}

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function toProduct(snapshot: DocumentSnapshot<DocumentData>): Product {
  const data = snapshot.data() ?? {};
  return {
    id: snapshot.id,
    name: String(data['nome'] ?? ''),
    quantity: toNumber(data['qtd']),
    createdAt: toNumber(data['dataC']),
  };
}

export function toStockMovement(snapshot: DocumentSnapshot<DocumentData>): StockMovement {
  const data = (snapshot.data() ?? {}) as Partial<HistoryDoc>;
  const item = data.itemT;
  return {
    id: snapshot.id,
    type: data.tipoT === 'Saída' ? 'exit' : 'entry',
    productId: String(item?.id ?? ''),
    productName: String(item?.nome ?? ''),
    previousQuantity: toNumber(item?.qtdpassado),
    movedQuantity: toNumber(item?.qtdMovimentado),
    resultingQuantity: toNumber(item?.qtd),
    reason: data.desc ?? null,
    userId: String(data.uid ?? ''),
    createdAt: toNumber(data.dataT),
  };
}

export function toHistoryDoc(movement: StockMovement): HistoryDoc {
  return {
    id: movement.id,
    dataT: movement.createdAt,
    tipoT: movement.type === 'exit' ? 'Saída' : 'Entrada',
    uid: movement.userId,
    ...(movement.reason ? { desc: movement.reason } : {}),
    itemT: {
      id: movement.productId,
      nome: movement.productName,
      qtdpassado: movement.previousQuantity,
      qtdMovimentado: movement.movedQuantity,
      qtd: movement.resultingQuantity,
    },
  };
}

export function toAppUser(uid: string, email: string, data: DocumentData | undefined): AppUser {
  return {
    uid,
    email,
    name: String(data?.['nome'] ?? email),
    role: data?.['categoria'] === 'adm' ? 'admin' : 'stockist',
  };
}
