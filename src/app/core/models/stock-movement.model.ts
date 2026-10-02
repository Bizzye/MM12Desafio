export type MovementType = 'entry' | 'exit';

export interface StockMovement {
  readonly id: string;
  readonly type: MovementType;
  readonly productId: string;
  readonly productName: string;
  readonly previousQuantity: number;
  readonly movedQuantity: number;
  readonly resultingQuantity: number;
  readonly reason: string | null;
  readonly userId: string;
  readonly createdAt: number;
}

/** Dados necessários para registrar uma movimentação; o restante é calculado de forma atômica pelo repositório. */
export interface MovementRequest {
  readonly type: MovementType;
  readonly productId: string;
  readonly quantity: number;
  readonly reason: string | null;
  readonly userId: string;
}

export const MOVEMENT_LABELS: Readonly<Record<MovementType, string>> = {
  entry: 'Entrada',
  exit: 'Saída',
};
