import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

/**
 * `bddgen` compila `features/**` + `steps/**` en specs de Playwright bajo
 * `.features-gen`. Ese es el `testDir` real.
 *
 * Proyecto único, 100% API — no abre navegador. Se llama "Omnicanalidad"
 * (en vez de "api") para que en el reporte HTML se vea el nombre real del
 * proyecto, sin repetir la palabra "api" junto con las etiquetas del Gherkin.
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
      name: 'Omnicanalidad',
    },
  ],
});
