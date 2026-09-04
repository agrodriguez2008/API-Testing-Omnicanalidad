import { test as base, createBdd } from 'playwright-bdd';
import { AuthService } from '@services/auth.service';
import { UsersService } from '@services/users.service';
import { PostsService } from '@services/posts.service';
import { ScenarioContext } from './context';

/**
 * Único lugar del proyecto donde se construye algo. Los steps piden lo que
 * necesitan (`async ({ authService }) => …`) y nunca hacen `new` ellos mismos.
 */
export interface TestFixtures {
  ctx: ScenarioContext;
  authService: AuthService;
  usersService: UsersService;
  postsService: PostsService;
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
});

export const expect = test.expect;

export const { Given, When, Then } = createBdd(test);
