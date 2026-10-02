import { AppUser } from '../../models/app-user.model';
import { Product } from '../../models/product.model';
import { StockMovement } from '../../models/stock-movement.model';

export interface DemoAccount {
  readonly user: AppUser;
  /** Apenas para o modo demonstração — nunca armazene senhas assim em produção. */
  readonly password: string;
}

export interface DemoSeed {
  readonly accounts: readonly DemoAccount[];
  readonly products: readonly Product[];
  readonly movements: readonly StockMovement[];
}

export const DEMO_PASSWORD = 'demo1234';

export const DEMO_ADMIN: AppUser = {
  uid: 'demo-admin',
  email: 'admin@mm12.demo',
  name: 'Ana Souza',
  role: 'admin',
};

export const DEMO_STOCKIST: AppUser = {
  uid: 'demo-stockist',
  email: 'estoque@mm12.demo',
  name: 'Bruno Lima',
  role: 'stockist',
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Gera dados fictícios com datas relativas a `now`, para a demo parecer sempre "recente". */
export function createDemoSeed(now = Date.now()): DemoSeed {
  const product = (id: string, name: string, quantity: number, daysAgo: number): Product => ({
    id,
    name,
    quantity,
    createdAt: now - daysAgo * DAY,
  });

  const products: Product[] = [
    product('p-01', 'Café torrado 500g', 48, 30),
    product('p-02', 'Açúcar refinado 1kg', 120, 30),
    product('p-03', 'Arroz tipo 1 5kg', 35, 28),
    product('p-04', 'Feijão carioca 1kg', 64, 28),
    product('p-05', 'Óleo de soja 900ml', 0, 21),
    product('p-06', 'Leite integral 1L', 210, 14),
    product('p-07', 'Macarrão espaguete 500g', 87, 10),
    product('p-08', 'Farinha de trigo 1kg', 15, 7),
    product('p-09', 'Molho de tomate 340g', 156, 3),
  ];

  const movement = (
    id: string,
    type: StockMovement['type'],
    productIndex: number,
    previousQuantity: number,
    movedQuantity: number,
    hoursAgo: number,
    userId: string,
    reason: string | null = null,
  ): StockMovement => ({
    id,
    type,
    productId: products[productIndex].id,
    productName: products[productIndex].name,
    previousQuantity,
    movedQuantity,
    resultingQuantity: type === 'entry' ? previousQuantity + movedQuantity : previousQuantity - movedQuantity,
    reason,
    userId,
    createdAt: now - hoursAgo * HOUR,
  });

  const movements: StockMovement[] = [
    movement('m-01', 'exit', 0, 60, 12, 2, DEMO_STOCKIST.uid, 'Venda balcão'),
    movement('m-02', 'entry', 5, 150, 60, 5, DEMO_STOCKIST.uid),
    movement('m-03', 'exit', 4, 24, 24, 9, DEMO_STOCKIST.uid, 'Pedido atacado #1042'),
    movement('m-04', 'exit', 7, 40, 25, 26, DEMO_ADMIN.uid, 'Transferência para filial'),
    movement('m-05', 'entry', 8, 96, 60, 30, DEMO_ADMIN.uid),
    movement('m-06', 'entry', 1, 80, 40, 50, DEMO_STOCKIST.uid),
    movement('m-07', 'exit', 2, 50, 15, 74, DEMO_STOCKIST.uid, 'Venda online'),
  ];

  return {
    accounts: [
      { user: DEMO_ADMIN, password: DEMO_PASSWORD },
      { user: DEMO_STOCKIST, password: DEMO_PASSWORD },
    ],
    products,
    movements,
  };
}
