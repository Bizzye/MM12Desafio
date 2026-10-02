import { Page, devices, expect, test } from '@playwright/test';

import { ADMIN, STOCKIST, loginAs, navigate, productRow } from './support/app';

/**
 * Gera as imagens usadas no README (`npm run screenshots`).
 * Roda contra o modo demo, então os dados são sempre os mesmos.
 */
const DIR = 'docs/screenshots';

async function shot(page: Page, name: string): Promise<void> {
  await page.waitForTimeout(400); // animações do Ionic
  await page.screenshot({ path: `${DIR}/${name}.png` });
}

test.describe.configure({ mode: 'serial' });

test('login', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('demo-accounts').getByRole('button', { name: 'Administrador' }).click();
  await shot(page, '01-login');
});

test('início, produtos, histórico e administração (admin)', async ({ page }) => {
  await loginAs(page, ADMIN);
  await shot(page, '02-home');

  await navigate(page, 'Produtos');
  await expect(page.getByTestId('product-row').first()).toBeVisible();
  await shot(page, '03-produtos');

  await productRow(page, 'Café torrado 500g').getByRole('button', { name: 'Saída' }).click();
  const alert = page.locator('ion-alert');
  await alert.getByPlaceholder('Quantidade').fill('100');
  await alert.getByPlaceholder('Motivo da saída').fill('Pedido atacado');
  await alert.getByRole('button', { name: 'Registrar saída' }).click();
  await expect(alert).toContainText('Estoque insuficiente');
  await shot(page, '04-saida-validacao');
  await alert.getByRole('button', { name: 'Cancelar' }).click();
  await expect(alert).toHaveCount(0);

  await navigate(page, 'Histórico');
  await expect(page.getByTestId('movement-row').first()).toBeVisible();
  await shot(page, '05-historico');

  await navigate(page, 'Administração');
  await page.getByRole('button', { name: 'Editar Arroz tipo 1 5kg' }).click();
  await shot(page, '06-administracao');
});

test.describe('mobile', () => {
  const { viewport, userAgent, isMobile, hasTouch } = devices['iPhone 13'];
  test.use({ viewport, userAgent, isMobile, hasTouch, deviceScaleFactor: 2 });

  test('início, produtos e histórico no celular', async ({ page }) => {
    await loginAs(page, STOCKIST);
    await shot(page, '07-mobile-home');
    await navigate(page, 'Produtos');
    await expect(page.getByTestId('product-row').first()).toBeVisible();
    await shot(page, '08-mobile-produtos');
    await navigate(page, 'Histórico');
    await expect(page.getByTestId('movement-row').first()).toBeVisible();
    await shot(page, '09-mobile-historico');
  });
});
