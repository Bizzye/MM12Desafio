import { Product } from '../models/product.model';
import { MovementRequest, StockMovement } from '../models/stock-movement.model';
import { StockError, ValidationError } from './app-errors';

export const MAX_PRODUCT_NAME_LENGTH = 80;

/**
 * Converte a entrada do usuário em quantidade inteira positiva.
 * Rejeita vazios, decimais, negativos, zero e textos como "12abc" (que `parseInt` aceitaria).
 */
export function parseQuantity(raw: unknown, { allowZero = false } = {}): number {
  const text = String(raw ?? '').trim();
  if (!/^\d+$/.test(text)) {
    throw new ValidationError('Informe um número inteiro válido.');
  }
  const value = Number(text);
  if (!Number.isSafeInteger(value)) {
    throw new ValidationError('Quantidade muito grande.');
  }
  if (value === 0 && !allowZero) {
    throw new ValidationError('A quantidade deve ser maior que zero.');
  }
  return value;
}

export function normalizeProductName(raw: unknown): string {
  const name = String(raw ?? '')
    .trim()
    .replace(/\s+/g, ' ');
  if (!name) {
    throw new ValidationError('Informe o nome do produto.');
  }
  if (name.length > MAX_PRODUCT_NAME_LENGTH) {
    throw new ValidationError(`O nome deve ter no máximo ${MAX_PRODUCT_NAME_LENGTH} caracteres.`);
  }
  return name;
}

/**
 * Regra de negócio central: calcula o novo saldo de uma movimentação.
 * Usada dentro das transações dos repositórios para garantir consistência.
 */
export function applyMovement(
  product: Product,
  request: MovementRequest,
  id: string,
  createdAt: number,
): StockMovement {
  if (request.quantity <= 0 || !Number.isSafeInteger(request.quantity)) {
    throw new StockError('A quantidade deve ser um inteiro maior que zero.');
  }
  const delta = request.type === 'entry' ? request.quantity : -request.quantity;
  const resultingQuantity = product.quantity + delta;
  if (resultingQuantity < 0) {
    throw new StockError(`Estoque insuficiente: há apenas ${product.quantity} unidade(s) de "${product.name}".`);
  }
  return {
    id,
    type: request.type,
    productId: product.id,
    productName: product.name,
    previousQuantity: product.quantity,
    movedQuantity: request.quantity,
    resultingQuantity,
    reason: request.reason?.trim() || null,
    userId: request.userId,
    createdAt,
  };
}

export const LOW_STOCK_THRESHOLD = 20;

export type StockStatus = 'out' | 'low' | 'ok';

export function stockStatus(quantity: number): StockStatus {
  if (quantity <= 0) {
    return 'out';
  }
  return quantity < LOW_STOCK_THRESHOLD ? 'low' : 'ok';
}
