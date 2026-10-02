import { expect, test } from '@playwright/test';

import { ADMIN, STOCKIST, login, loginAs, navigate } from './support/app';

test.describe('Autenticação e perfis de acesso', () => {
  test('redireciona visitantes para o login', async ({ page }) => {
    await page.goto('/products');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page).toHaveTitle('Entrar · MM12 Estoque');
  });

  test('exibe mensagem genérica para credenciais inválidas', async ({ page }) => {
    await login(page, ADMIN.email, 'senha-errada');
    await expect(page.getByTestId('login-error')).toHaveText(/E-mail ou senha inválidos/);
    await expect(page).toHaveURL(/\/login$/);
  });

  test('preenche credenciais de demonstração com um clique', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('demo-accounts').getByRole('button', { name: 'Estoquista' }).click();
    await expect(page.getByLabel('E-mail')).toHaveValue(STOCKIST.email);
  });

  test('administrador acessa a área administrativa', async ({ page }) => {
    await loginAs(page, ADMIN);
    await expect(page.getByTestId('user-role')).toHaveText('Administrador');
    await navigate(page, 'Administração');
    await expect(page.getByRole('heading', { name: 'Administração' })).toBeVisible();
  });

  test('estoquista não vê nem acessa a área administrativa', async ({ page }) => {
    await loginAs(page, STOCKIST);
    await expect(page.getByTestId('user-role')).toHaveText('Estoquista');
    const menu = page.getByRole('navigation', { name: 'Menu principal' });
    await expect(menu.getByRole('link', { name: 'Administração' })).toHaveCount(0);

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/home$/);
  });

  test('mantém a sessão ao recarregar e encerra no logout', async ({ page }) => {
    await loginAs(page, STOCKIST);
    await page.reload();
    await expect(page).toHaveURL(/\/home$/);

    await page.getByRole('button', { name: 'Sair' }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto('/home');
    await expect(page).toHaveURL(/\/login$/);
  });
});
