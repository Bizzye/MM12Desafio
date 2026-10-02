import { Page, expect } from '@playwright/test';

export const DEMO_PASSWORD = 'demo1234';
export const ADMIN = { email: 'admin@mm12.demo', name: 'Ana Souza' };
export const STOCKIST = { email: 'estoque@mm12.demo', name: 'Bruno Lima' };

export async function login(page: Page, email: string, password = DEMO_PASSWORD): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
}

export async function loginAs(page: Page, user: { email: string; name: string }): Promise<void> {
  await login(page, user.email);
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole('heading', { name: new RegExp(user.name) })).toBeVisible();
}

/** Navega pelo menu lateral (funciona em desktop e mobile, onde o rótulo fica oculto). */
export async function navigate(page: Page, label: string): Promise<void> {
  await page.getByRole('navigation', { name: 'Menu principal' }).getByRole('link', { name: label }).click();
}

/** Preenche e confirma um ion-alert com campos de entrada. */
export async function fillAlert(page: Page, values: Record<string, string>, confirm: string): Promise<void> {
  const alert = page.locator('ion-alert');
  await expect(alert).toBeVisible();
  for (const [placeholder, value] of Object.entries(values)) {
    await alert.getByPlaceholder(placeholder).fill(value);
  }
  await alert.getByRole('button', { name: confirm }).click();
}

export function productRow(page: Page, name: string) {
  return page.getByTestId('product-row').filter({ hasText: name });
}
