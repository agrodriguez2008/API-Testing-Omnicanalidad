import { test as base, createBdd } from 'playwright-bdd';
import { AuthService } from '@services/auth.service';
import { UsersService } from '@services/users.service';
import { PostsService } from '@services/posts.service';
import { env } from '@config/env';
import { ScenarioContext } from './context';

/**
 * Unico lugar del proyecto donde se construye algo. Los steps piden lo que
 * necesitan (`async ({ authService }) => …`) y nunca hacen `new` ellos mismos.
 */
export interface TestFixtures {
  ctx: ScenarioContext;
  authService: AuthService;
  usersService: UsersService;
  postsService: PostsService;
  /** No se pide en ningun step: `auto: true` hace que corra sola en cada test. */
  ambiente: void;
}

export const test = base.extend<TestFixtures>({
  ctx: async ({}, use) => {
    await use(new ScenarioContext());
  },

  // Ninguno depende de `page`: este proyecto es 100% API, nunca lanza navegador.
  authService: async ({}, use) => {
    await use(new AuthService());
  },
  usersService: async ({}, use) => {
    await use(new UsersService());
  },
  postsService: async ({}, use) => {
    await use(new PostsService());
  },

  // Deja "Ambiente: Prueba" (o lo que diga .env) como anotacion visible en
  // el reporte HTML, junto al nombre de cada caso — para que quien lo abra
  // sepa contra que ambiente corrio sin tener que preguntar.
  ambiente: [
    async ({}, use, testInfo) => {
      testInfo.annotations.push({ type: 'Ambiente', description: env.ambiente });
      await use();
    },
    { auto: true },
  ],
});

export const expect = test.expect;

export const { Given, When, Then } = createBdd(test);
