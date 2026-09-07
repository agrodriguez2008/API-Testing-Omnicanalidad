import { Given, When, Then, expect } from '@fixtures/test';
import type { User } from '@services/users.service';
import type { Post, DeletedPost } from '@services/posts.service';

// El step "Dado que inicie sesion con el usuario de prueba" que usan estos
// escenarios como precondicion esta definido en autenticacion.steps.ts, no
// aqui -- los steps son una libreria compartida entre todos los .feature.

// --- Crear cuenta: el id que devuelve la consulta del cliente alimenta la creacion ---

// Id de ejemplo fijo. No se pide como dato en el Gherkin ni se muestra en el
// reporte amigable — para quien lee el caso, lo que importa es que el
// cliente ya existe, no cual numero interno tiene.
const CLIENTE_DEMO_ID = 1;

Given('que existe un cliente registrado en el banco', async ({ usersService, ctx }) => {
  ctx.setResponse(await usersService.getById(CLIENTE_DEMO_ID));
  ctx.setUserId(ctx.response<User>().data.id);
});

When(
  'creo la cuenta {string} para ese cliente',
  async ({ postsService, ctx }, nombreCuenta: string) => {
    ctx.setResponse(await postsService.create({ title: nombreCuenta, userId: ctx.userId() }));
    ctx.setAccountId(ctx.response<Post>().data.id);
  },
);

Then('la cuenta queda creada para el mismo cliente', async ({ ctx }) => {
  const data = ctx.response<Post>().data;
  expect(data.userId).toBe(ctx.userId());
});

// --- Eliminar una cuenta: buscarla y mandar el DELETE ---

// dummyjson.com no persiste lo que crea `postsService.create()` — el id que
// devuelve (ej. 252) no existe de verdad, asi que buscarlo o borrarlo
// despues da 404. Por eso este flujo usa una cuenta que si existe en el
// banco (igual que "que existe un cliente registrado en el banco"), en vez
// de encadenarse con el escenario de creacion.
const CUENTA_DEMO_ID = 2;

Given('que existe una cuenta registrada en el banco', async ({ postsService, ctx }) => {
  ctx.setResponse(await postsService.getById(CUENTA_DEMO_ID));
  ctx.setAccountId(ctx.response<Post>().data.id);
});

// --- Buscar en la base de datos: caso propio, visible en el reporte ---
// (antes la busqueda quedaba escondida dentro del step de eliminar; ahora
// tambien existe como su propio escenario, con su propio Entonces.)

When('busco una cuenta existente en la base de datos', async ({ postsService, ctx }) => {
  // Deja ver primero la consulta SQL (simulada, ver nota en el service) y
  // despues trae el dato real, para que el paso se lea como "entro a la
  // base de datos y traigo la cuenta".
  ctx.setResponse(await postsService.buscarEnBaseDeDatos(CUENTA_DEMO_ID));
});

Then('encuentro la cuenta y veo sus datos completos', async ({ ctx }) => {
  const data = ctx.response<Post>().data;
  expect(data.id).toBe(CUENTA_DEMO_ID);
  expect(data.title).toBeTruthy();
});

When('busco esa cuenta y la elimino', async ({ postsService, ctx }) => {
  // La busqueda ("¿existe esto en la base de datos?") no es lo que se
  // valida en este step — lo que importa es la respuesta del DELETE.
  await postsService.getById(ctx.accountId());
  ctx.setResponse(await postsService.remove(ctx.accountId()));
});

Then('la cuenta queda marcada como eliminada', async ({ ctx }) => {
  const data = ctx.response<DeletedPost>().data;
  expect(data.isDeleted).toBe(true);
});

Then('vuelvo a consultarla para dejar evidencia de la validacion', async ({ postsService, ctx }) => {
  // Esta API publica no persiste el DELETE (dummyjson.com solo lo simula),
  // asi que esta consulta va a traer el mismo registro otra vez — no se
  // puede usar para probar que desaparecio. Sirve para dejar la evidencia
  // de la consulta en el reporte; en Omnicanalidad este mismo step
  // consultaria la base de datos real para confirmar que ya no existe.
  const response = await postsService.getById(
    ctx.accountId(),
    'Volver a consultar la cuenta para dejar evidencia de la validacion',
  );
  expect(response.status).toBe(200);
  ctx.setResponse(response);
});
