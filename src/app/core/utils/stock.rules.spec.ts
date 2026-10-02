import { Product } from '../models/product.model';
import { MovementRequest } from '../models/stock-movement.model';
import { StockError, ValidationError } from './app-errors';
import {
  LOW_STOCK_THRESHOLD,
  MAX_PRODUCT_NAME_LENGTH,
  applyMovement,
  normalizeProductName,
  parseQuantity,
  stockStatus,
} from './stock.rules';

describe('stock.rules', () => {
  describe('parseQuantity', () => {
    it('converte inteiros positivos, ignorando espaços', () => {
      expect(parseQuantity('12')).toBe(12);
      expect(parseQuantity(' 7 ')).toBe(7);
      expect(parseQuantity(3)).toBe(3);
    });

    for (const invalid of ['', '   ', 'abc', '12abc', '1.5', '-3', '1e3', null, undefined]) {
      it(`rejeita ${JSON.stringify(invalid)}`, () => {
        expect(() => parseQuantity(invalid)).toThrowError(ValidationError, 'Informe um número inteiro válido.');
      });
    }

    it('rejeita zero por padrão e aceita quando permitido', () => {
      expect(() => parseQuantity('0')).toThrowError(ValidationError, 'A quantidade deve ser maior que zero.');
      expect(parseQuantity('0', { allowZero: true })).toBe(0);
    });

    it('rejeita números acima do limite seguro', () => {
      expect(() => parseQuantity('99999999999999999999')).toThrowError(ValidationError, 'Quantidade muito grande.');
    });
  });

  describe('normalizeProductName', () => {
    it('remove espaços extras', () => {
      expect(normalizeProductName('  Café   torrado  ')).toBe('Café torrado');
    });

    it('exige um nome', () => {
      expect(() => normalizeProductName('   ')).toThrowError(ValidationError);
      expect(() => normalizeProductName(null)).toThrowError(ValidationError);
    });

    it('limita o tamanho do nome', () => {
      expect(normalizeProductName('a'.repeat(MAX_PRODUCT_NAME_LENGTH)).length).toBe(MAX_PRODUCT_NAME_LENGTH);
      expect(() => normalizeProductName('a'.repeat(MAX_PRODUCT_NAME_LENGTH + 1))).toThrowError(ValidationError);
    });
  });

  describe('applyMovement', () => {
    const product: Product = { id: 'p1', name: 'Café', quantity: 10, createdAt: 0 };
    const request = (overrides: Partial<MovementRequest> = {}): MovementRequest => ({
      type: 'entry',
      productId: 'p1',
      quantity: 5,
      reason: null,
      userId: 'u1',
      ...overrides,
    });

    it('soma a quantidade nas entradas', () => {
      const movement = applyMovement(product, request(), 'm1', 123);
      expect(movement).toEqual({
        id: 'm1',
        type: 'entry',
        productId: 'p1',
        productName: 'Café',
        previousQuantity: 10,
        movedQuantity: 5,
        resultingQuantity: 15,
        reason: null,
        userId: 'u1',
        createdAt: 123,
      });
    });

    it('subtrai nas saídas e normaliza o motivo', () => {
      const movement = applyMovement(product, request({ type: 'exit', quantity: 10, reason: '  Venda ' }), 'm1', 1);
      expect(movement.resultingQuantity).toBe(0);
      expect(movement.reason).toBe('Venda');
    });

    it('trata motivo em branco como ausente', () => {
      expect(applyMovement(product, request({ reason: '   ' }), 'm1', 1).reason).toBeNull();
    });

    it('impede saldo negativo', () => {
      expect(() => applyMovement(product, request({ type: 'exit', quantity: 11 }), 'm1', 1)).toThrowError(
        StockError,
        'Estoque insuficiente: há apenas 10 unidade(s) de "Café".',
      );
    });

    it('rejeita quantidades inválidas mesmo se a validação da UI for contornada', () => {
      expect(() => applyMovement(product, request({ quantity: 0 }), 'm1', 1)).toThrowError(StockError);
      expect(() => applyMovement(product, request({ quantity: 1.5 }), 'm1', 1)).toThrowError(StockError);
    });
  });

  describe('stockStatus', () => {
    it('classifica o nível de estoque', () => {
      expect(stockStatus(0)).toBe('out');
      expect(stockStatus(LOW_STOCK_THRESHOLD - 1)).toBe('low');
      expect(stockStatus(LOW_STOCK_THRESHOLD)).toBe('ok');
    });
  });
});
