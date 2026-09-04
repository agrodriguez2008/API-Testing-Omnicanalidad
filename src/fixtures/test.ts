import { test as base, createBdd } from 'playwright-bdd';
import { LoginPage } from '@pages/login.page';
import { PostsService } from '@services/posts.service';
import { ScenarioContext } from './context';

/**
 * Único lugar del proyecto donde se construye algo. Los steps piden lo que
 * necesitan (`async ({ loginPage }) => …`) y nunca hacen `new` ellos mismos.
 */
export interface TestFixtures {
  ctx: ScenarioContext;
  loginPage: LoginPage;
  postsService: PostsService;
}

export const test = base.extend<TestFixtures>({
  ctx: async ({}, use) => {
    await use(new ScenarioContext());
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  // No depende de `page`: así el proyecto `api` no lanza navegador.
  postsService: async ({}, use) => {
    await use(new PostsService());
  },
});

export const expect = test.expect;

export const { Given, When, Then } = createBdd(test);
