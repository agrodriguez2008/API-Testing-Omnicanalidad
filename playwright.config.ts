import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

/**
 * `bddgen` compila `features/**` + `steps/**` en specs de Playwright bajo
 * `.features-gen`. Ese es el `testDir` real.
 *
 * Proyecto único: `api` — este proyecto es solo de API, no abre navegador.
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
  projects: [
    {
      name: 'api',
      grep: /@api/,
    },
  ],
});
