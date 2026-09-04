import { test as base, createBdd } from 'playwright-bdd';
import { PostsService } from '@services/posts.service';
import { ScenarioContext } from './context';

/**
 * Único lugar del proyecto donde se construye algo. Los steps piden lo que
 * necesitan (`async ({ postsService }) => …`) y nunca hacen `new` ellos mismos.
 */
export interface TestFixtures {
  ctx: ScenarioContext;
  postsService: PostsService;
}

export const test = base.extend<TestFixtures>({
  ctx: async ({}, use) => {
    await use(new ScenarioContext());
  },

  // No depende de `page`: este proyecto es 100% API, nunca lanza navegador.
  postsService: async ({}, use) => {
    await use(new PostsService());
  },
});

export const expect = test.expect;

export const { Given, When, Then } = createBdd(test);
