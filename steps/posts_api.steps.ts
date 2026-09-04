import { When, Then, expect } from '@fixtures/test';
import type { Post } from '@services/posts.service';

When('pido el post {int}', async ({ postsService, ctx }, id: number) => {
  ctx.setResponse(await postsService.getById(id));
});

When('creo un post titulado {string}', async ({ postsService, ctx }, title: string) => {
  ctx.setResponse(await postsService.create({ userId: 1, title, body: 'contenido de prueba' }));
});

Then('la respuesta tiene status {int}', async ({ ctx }, status: number) => {
  expect(ctx.response().status).toBe(status);
});

Then('el post tiene id {int}', async ({ ctx }, id: number) => {
  expect(ctx.response<Post>().data.id).toBe(id);
});
