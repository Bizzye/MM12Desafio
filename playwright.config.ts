import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;
const baseURL = `http://localhost:${PORT}`;

/**
 * Testes E2E rodam contra o build `demo` (repositórios em memória), então não
 * dependem de credenciais nem alteram dados do Firebase.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 2 : undefined,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /screenshots\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      testIgnore: /screenshots\.spec\.ts/,
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'screenshots',
      testMatch: /screenshots\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
    },
  ],
  webServer: {
    command: `npx ng serve --configuration demo --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env['CI'],
    timeout: 180_000,
  },
});
