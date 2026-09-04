import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

/**
 * `bddgen` compila `features/**` + `steps/**` en specs de Playwright bajo
 * `.features-gen`. Ese es el `testDir` real.
 *
 * Proyecto único, 100% API — no abre navegador. Se llama con el nombre real
 * del proyecto para que se vea así en el reporte HTML — ojo: la palabra
 * "Project:" que Playwright pone antes en el reporte es parte fija de su
 * interfaz (en inglés) y no se puede traducir sin reescribir el reportero;
 * lo que sí es 100% nuestro y ya está en español es el valor que sigue.
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
      name: 'Proyecto API Omnicanalidad Banco Banrural',
    },
  ],
});
