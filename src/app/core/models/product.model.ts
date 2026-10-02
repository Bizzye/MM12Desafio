export interface Product {
  readonly id: string;
  readonly name: string;
  readonly quantity: number;
  readonly createdAt: number;
}

export interface NewProduct {
  readonly name: string;
  readonly quantity: number;
}
