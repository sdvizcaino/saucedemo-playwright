import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

/**
 * Configuración de Playwright para SauceDemo.
 * - Video y screenshot en todos los tests (evidencia).
 * - Trace solo cuando un test falla (diagnóstico sin inflar artefactos).
 * - La suite NO se detiene ante fallas: cada test es independiente.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    video: 'on',
    screenshot: 'on',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
