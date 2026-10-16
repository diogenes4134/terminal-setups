import { defineConfig, devices } from '@playwright/test';

const PORT = 4323;
const CI = !!process.env.CI;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'] } },
    { name: 'movil', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    // base de datos propia y vacía para los tests; --ignore-lock mantiene el servidor en primer plano
    command: `rm -f e2e.db && drizzle-kit migrate && astro dev --port ${PORT} --ignore-lock`,
    env: { TURSO_DATABASE_URL: 'file:e2e.db', ASTRO_TELEMETRY_DISABLED: '1' },
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !CI,
    timeout: 120_000,
  },
});
