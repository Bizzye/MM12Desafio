import { expect, test } from '@playwright/test';

import { ADMIN, STOCKIST, fillAlert, loginAs, navigate, productRow } from './support/app';

test.describe('Movimentação de estoque', () => {
  test('registra entrada e saída e grava no histórico', async ({ page }) => {
    await loginAs(page, STOCKIST);
    await navigate(page, 'Produtos');

    const row = productRow(page, 'Café torrado 500g');
    await expect(row).toContainText('48');

    await row.getByRole('button', { name: 'Entrada' }).click();
    await fillAlert(page, { Quantidade: '12' }, 'Registrar entrada');
    await expect(page.locator('ion-toast')).toContainText('Entrada registrada');
    await expect(row).toContainText('60');

    await row.getByRole('button', { name: 'Saída' }).click();
    await fillAlert(page, { Quantidade: '5', 'Motivo da saída': 'Venda E2E' }, 'Registrar saída');
    await expect(row).toContainText('55');

    await navigate(page, 'Histórico');
    const latest = page.getByTestId('movement-row').first();
    await expect(latest).toContainText('Café torrado 500g');
    await expect(latest).toContainText('Saída');
    await expect(latest).toContainText('Venda E2E');
  });

  test('impede saída maior que o saldo e mantém o diálogo aberto', async ({ page }) => {
    await loginAs(page, STOCKIST);
    await navigate(page, 'Produtos');

    const row = productRow(page, 'Farinha de trigo 1kg');
    await row.getByRole('button', { name: 'Saída' }).click();
    await fillAlert(page, { Quantidade: '999', 'Motivo da saída': 'Teste' }, 'Registrar saída');

    const alert = page.locator('ion-alert');
    await expect(alert).toContainText('Estoque insuficiente');
    await alert.getByRole('button', { name: 'Cancelar' }).click();
    await expect(row).toContainText('15');
  });

  test('desabilita saída de produto esgotado', async ({ page }) => {
    await loginAs(page, STOCKIST);
    await navigate(page, 'Produtos');
    await expect(productRow(page, 'Óleo de soja').getByRole('button', { name: 'Saída' })).toBeDisabled();
  });

  test('busca ignora acentos e maiúsculas', async ({ page }) => {
    await loginAs(page, STOCKIST);
    await navigate(page, 'Produtos');
    await page.getByPlaceholder('Pesquisar produto').fill('FEIJAO');
    await expect(page.getByTestId('product-row')).toHaveCount(1);
    await expect(page.getByTestId('product-row')).toContainText('Feijão carioca');
  });
});

test.describe('Administração de produtos', () => {
  test('cadastra, renomeia e remove um produto', async ({ page }) => {
    await loginAs(page, ADMIN);
    await navigate(page, 'Administração');

    await page.getByLabel('Nome do produto').fill('Chá verde 20 sachês');
    await page.getByLabel('Quantidade inicial').fill('30');
    await page.getByRole('button', { name: 'Adicionar' }).click();

    const row = page.getByTestId('admin-row').filter({ hasText: 'Chá verde 20 sachês' });
    await expect(row).toContainText('30');

    await row.getByRole('button', { name: 'Editar Chá verde 20 sachês' }).click();
    await page.getByLabel('Novo nome do produto').fill('Chá verde 25 sachês');
    await page.getByRole('button', { name: 'Salvar' }).click();
    const renamed = page.getByTestId('admin-row').filter({ hasText: 'Chá verde 25 sachês' });
    await expect(renamed).toBeVisible();

    await renamed.getByRole('button', { name: /^Remover/ }).click();
    await page.locator('ion-alert').getByRole('button', { name: 'Remover' }).click();
    await expect(renamed).toHaveCount(0);
  });

  test('não permite cadastrar produto sem nome', async ({ page }) => {
    await loginAs(page, ADMIN);
    await navigate(page, 'Administração');
    await expect(page.getByRole('button', { name: 'Adicionar' })).toBeDisabled();
  });
});
