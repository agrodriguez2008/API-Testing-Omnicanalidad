import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

/**
 * `bddgen` compila `features/**` + `steps/**` en specs de Playwright bajo
 * `.features-gen`. Ese es el `testDir` real.
 *
 * Proyecto unico, 100% API — no abre navegador. Se llama con el nombre real
 * del proyecto para que se vea asi en el reporte HTML — ojo: la palabra
 * "Project:" que Playwright pone antes en el reporte es parte fija de su
 * interfaz (en ingles) y no se puede traducir sin reescribir el reportero;
 * lo que si es 100% nuestro y ya esta en español es el valor que sigue.
 */
const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: ['steps/*.ts', 'src/fixtures/*.ts'],
  // Falla la generacion en vez de producir un test vacio en silencio.
  missingSteps: 'fail-on-gen',
});

export default defineConfig({
  testDir,
  timeout: 30000,
  // Un solo worker: los 6 casos corren uno por uno, en el orden en que estan
  // escritos en el .feature (util para presentaciones — "obtener token"
  // siempre se ve primero). De paso, evita mandarle varias llamadas al
  // mismo tiempo a dummyjson.com (API publica compartida), que es una causa
  // tipica de fallos intermitentes cuando varios casos le pegan a la vez.
  workers: 1,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  projects: [
    {
      name: 'API Omnicanalidad Banco Banrural',
    },
  ],
});
