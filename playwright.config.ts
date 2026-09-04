import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { env } from './src/config/env';

/**
 * `bddgen` compila `features/**` + `steps/**` en specs de Playwright bajo
 * `.features-gen`. Ese es el `testDir` real — por eso el runner estándar de
 * Playwright (workers, retries, traces, modo UI) sigue funcionando igual.
 */
const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: ['steps/*.ts', 'src/fixtures/*.ts'],
  // Falla la generación en vez de producir un test vacío en silencio.
  missingSteps: 'fail-on-gen',
});

export default defineConfig({
  testDir,
  timeout: 30000,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: env.baseUrl,
    // Sauce Demo trae `data-test` en cada control.
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'ui',
      use: { ...devices['Desktop Chrome'] },
      grep: /@ui/,
    },
    {
      name: 'api',
      // Los escenarios de API nunca abren navegador.
      grep: /@api/,
    },
  ],
});
