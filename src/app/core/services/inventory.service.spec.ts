import { TestBed } from '@angular/core/testing';
import { firstValueFrom, throwError } from 'rxjs';

import { provideTestApp, signInAs } from '../../../testing/test-helpers';
import { DEMO_ADMIN, DEMO_STOCKIST } from '../infra/in-memory/demo-data';
import { ProductRepository } from '../repositories/product.repository';
import { AuthError, StockError, ValidationError } from '../utils/app-errors';
import { InventoryService } from './inventory.service';

describe('InventoryService', () => {
  let service: InventoryService;

  const findProduct = async (name: string) =>
    (await firstValueFrom(service.products$)).find((product) => product.name === name);

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: provideTestApp() });
    service = TestBed.inject(InventoryService);
  });

  describe('como administrador', () => {
    beforeEach(() => signInAs(DEMO_ADMIN));

    it('cadastra produto com nome normalizado', async () => {
      await service.addProduct('  Chá   verde ', '0');
      expect(await findProduct('Chá verde')).toEqual(jasmine.objectContaining({ quantity: 0 }));
    });

    it('valida os dados do produto', async () => {
      await expectAsync(service.addProduct('', 1)).toBeRejectedWithError(ValidationError);
      await expectAsync(service.addProduct('Chá', '-1')).toBeRejectedWithError(ValidationError);
    });

    it('renomeia e remove produtos', async () => {
      await service.renameProduct('p-01', 'Café especial 500g');
      expect(await findProduct('Café especial 500g')).toBeDefined();

      await service.removeProduct('p-01');
      expect(await findProduct('Café especial 500g')).toBeUndefined();
    });
  });

  describe('como estoquista', () => {
    beforeEach(() => signInAs(DEMO_STOCKIST));

    it('não pode alterar o catálogo', async () => {
      await expectAsync(service.addProduct('Chá', 1)).toBeRejectedWithError(AuthError);
      await expectAsync(service.renameProduct('p-01', 'X')).toBeRejectedWithError(AuthError);
      await expectAsync(service.removeProduct('p-01')).toBeRejectedWithError(AuthError);
    });

    it('registra entrada em nome do usuário logado', async () => {
      const movement = await service.registerEntry('p-01', '10');
      expect(movement).toEqual(
        jasmine.objectContaining({ type: 'entry', userId: DEMO_STOCKIST.uid, resultingQuantity: 58, reason: null }),
      );
    });

    it('registra saída exigindo motivo', async () => {
      await expectAsync(service.registerExit('p-01', 1, '  ')).toBeRejectedWithError(
        ValidationError,
        'Informe o motivo da saída.',
      );
      const movement = await service.registerExit('p-01', 8, ' Venda ');
      expect(movement.resultingQuantity).toBe(40);
      expect(movement.reason).toBe('Venda');
    });

    it('rejeita saída acima do saldo', async () => {
      await expectAsync(service.registerExit('p-08', 16, 'Venda')).toBeRejectedWithError(StockError);
    });
  });

  it('exige sessão para movimentar estoque', async () => {
    await expectAsync(service.registerEntry('p-01', 1)).toBeRejectedWithError(AuthError);
  });

  it('não quebra a tela se o stream de produtos falhar', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideTestApp(),
        { provide: ProductRepository, useValue: { watchAll: () => throwError(() => new Error('offline')) } },
      ],
    });
    const consoleError = spyOn(console, 'error');

    expect(await firstValueFrom(TestBed.inject(InventoryService).products$)).toEqual([]);
    expect(consoleError).toHaveBeenCalled();
  });
});
