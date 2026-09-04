import { Given, When, Then, expect } from '@fixtures/test';
import type { LoginResponse } from '@services/auth.service';
import type { User } from '@services/users.service';
import type { Post } from '@services/posts.service';

// --- Login y token ---

When(
  'inicio sesión con el usuario {string} y la contraseña {string}',
  async ({ authService, ctx }, username: string, password: string) => {
    ctx.setResponse(await authService.login(username, password));
  },
);

Then('obtengo un token de acceso válido', async ({ ctx }) => {
  const data = ctx.response<LoginResponse>().data;
  expect(data.accessToken).toBeTruthy();
});

Given(
  'que inicié sesión con el usuario {string} y la contraseña {string}',
  async ({ authService, ctx }, username: string, password: string) => {
    ctx.setResponse(await authService.login(username, password));
    ctx.setToken(ctx.response<LoginResponse>().data.accessToken);
  },
);

When('consulto mi perfil usando ese token', async ({ authService, ctx }) => {
  ctx.setResponse(await authService.me(ctx.token()));
});

Then('veo los datos del usuario {string}', async ({ ctx }, username: string) => {
  const data = ctx.response<LoginResponse>().data;
  expect(data.username).toBe(username);
});

// --- Encadenamiento: el id que devuelve un GET alimenta un POST ---

Given('que existe el cliente número {int}', async ({ usersService, ctx }, id: number) => {
  ctx.setResponse(await usersService.getById(id));
  ctx.setUserId(ctx.response<User>().data.id);
});

When(
  'registro una solicitud titulada {string} para ese cliente',
  async ({ postsService, ctx }, title: string) => {
    ctx.setResponse(await postsService.create({ title, userId: ctx.userId() }));
  },
);

Then('la solicitud queda registrada con el mismo cliente', async ({ ctx }) => {
  const data = ctx.response<Post>().data;
  expect(data.userId).toBe(ctx.userId());
});
