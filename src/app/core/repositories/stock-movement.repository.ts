import { Observable } from 'rxjs';

import { MovementRequest, StockMovement } from '../models/stock-movement.model';

export abstract class StockMovementRepository {
  /** Histórico em tempo real, do mais recente para o mais antigo. */
  abstract watchAll(): Observable<StockMovement[]>;

  /**
   * Registra a movimentação e atualiza o saldo do produto numa única operação atômica
   * (transação), evitando condições de corrida entre usuários simultâneos.
   *
   * @throws {StockError} quando o produto não existe ou o saldo é insuficiente.
   */
  abstract register(request: MovementRequest): Promise<StockMovement>;
}
