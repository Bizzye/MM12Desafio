import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { FIXED_NOW, MemoryStorage, provideTestDataAccess } from '../../../../testing/test-helpers';
import { AuthRepository } from '../../repositories/auth.repository';
import { ProductRepository } from '../../repositories/product.repository';
import { StockMovementRepository } from '../../repositories/stock-movement.repository';
import { AppError, AuthError, StockError } from '../../utils/app-errors';
import { DEMO_LOGIN_HINT } from '../demo-login-hint';
import { DEMO_ADMIN, DEMO_PASSWORD, DEMO_STOCKIST, createDemoSeed } from './demo-data';
import { DEMO_SESSION_STORAGE } from './in-memory.store';

describe('Repositórios em memória', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: provideTestDataAccess() }));

  describe('InMemoryAuthRepository', () => {
    it('começa sem sessão e autentica com credenciais válidas', async () => {
      const repository = TestBed.inject(AuthRepository);
      expect(await firstValueFrom(repository.user$)).toBeNull();

      await repository.signIn(DEMO_ADMIN.email.toUpperCase(), DEMO_PASSWORD);

      expect(await firstValueFrom(repository.user$)).toEqual(DEMO_ADMIN);
      expect(TestBed.inject(DEMO_SESSION_STORAGE).getItem('mm12-demo-session')).toBe(DEMO_ADMIN.uid);
    });

    it('rejeita senha errada e e-mail inexistente com a mesma mensagem', async () => {
      const repository = TestBed.inject(AuthRepository);
      await expectAsync(repository.signIn(DEMO_ADMIN.email, 'errada')).toBeRejectedWithError(
        AuthError,
        'E-mail ou senha inválidos.',
      );
      await expectAsync(repository.signIn('ninguem@x.com', DEMO_PASSWORD)).toBeRejectedWithError(
        AuthError,
        'E-mail ou senha inválidos.',
      );
    });

    it('restaura a sessão salva e encerra no logout', async () => {
      const storage = new MemoryStorage();
      storage.setItem('mm12-demo-session', DEMO_STOCKIST.uid);
      TestBed.overrideProvider(DEMO_SESSION_STORAGE, { useValue: storage });
      const repository = TestBed.inject(AuthRepository);

      expect(await firstValueFrom(repository.user$)).toEqual(DEMO_STOCKIST);

      await repository.signOut();
      expect(await firstValueFrom(repository.user$)).toBeNull();
      expect(storage.getItem('mm12-demo-session')).toBeNull();
    });

    it('fornece as contas de demonstração para a tela de login', () => {
      expect(TestBed.inject(DEMO_LOGIN_HINT)?.accounts.map((a) => a.email)).toEqual([
        DEMO_ADMIN.email,
        DEMO_STOCKIST.email,
      ]);
    });
  });

  describe('InMemoryProductRepository', () => {
    it('lista produtos ordenados por nome', async () => {
      const names = (await firstValueFrom(TestBed.inject(ProductRepository).watchAll())).map((p) => p.name);
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'pt-BR')));
      expect(names.length).toBe(createDemoSeed(FIXED_NOW).products.length);
    });

    it('cria, renomeia e remove produtos', async () => {
      const repository = TestBed.inject(ProductRepository);
      await repository.create({ name: 'Chá', quantity: 3 });
      const created = (await firstValueFrom(repository.watchAll())).find((p) => p.name === 'Chá')!;
      expect(created.quantity).toBe(3);

      await repository.rename(created.id, 'Chá verde');
      expect((await firstValueFrom(repository.watchAll())).some((p) => p.name === 'Chá verde')).toBeTrue();

      await repository.remove(created.id);
      expect((await firstValueFrom(repository.watchAll())).some((p) => p.id === created.id)).toBeFalse();
    });

    it('falha ao alterar produto inexistente', async () => {
      const repository = TestBed.inject(ProductRepository);
      await expectAsync(repository.rename('nao-existe', 'X')).toBeRejectedWithError(
        AppError,
        'Produto não encontrado.',
      );
      await expectAsync(repository.remove('nao-existe')).toBeRejectedWithError(AppError);
    });
  });

  describe('InMemoryStockMovementRepository', () => {
    it('registra a movimentação e atualiza o saldo atomicamente', async () => {
      const movements = TestBed.inject(StockMovementRepository);
      const products = TestBed.inject(ProductRepository);

      const movement = await movements.register({
        type: 'exit',
        productId: 'p-01',
        quantity: 8,
        reason: 'Venda',
        userId: DEMO_STOCKIST.uid,
      });

      expect(movement.previousQuantity).toBe(48);
      expect(movement.resultingQuantity).toBe(40);
      expect((await firstValueFrom(products.watchAll())).find((p) => p.id === 'p-01')?.quantity).toBe(40);
      expect((await firstValueFrom(movements.watchAll()))[0]).toEqual(movement);
    });

    it('não altera nada quando o saldo é insuficiente', async () => {
      const movements = TestBed.inject(StockMovementRepository);
      const before = await firstValueFrom(movements.watchAll());

      await expectAsync(
        movements.register({ type: 'exit', productId: 'p-08', quantity: 999, reason: 'x', userId: 'u' }),
      ).toBeRejectedWithError(StockError);

      expect(await firstValueFrom(movements.watchAll())).toEqual(before);
    });

    it('rejeita produto inexistente', async () => {
      await expectAsync(
        TestBed.inject(StockMovementRepository).register({
          type: 'entry',
          productId: 'nao-existe',
          quantity: 1,
          reason: null,
          userId: 'u',
        }),
      ).toBeRejectedWithError(StockError, /Produto não encontrado/);
    });

    it('lista do mais recente para o mais antigo', async () => {
      const dates = (await firstValueFrom(TestBed.inject(StockMovementRepository).watchAll())).map((m) => m.createdAt);
      expect(dates).toEqual([...dates].sort((a, b) => b - a));
    });
  });
});
