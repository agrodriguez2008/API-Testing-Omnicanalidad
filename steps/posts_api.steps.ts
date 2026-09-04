import { Given, When, Then, expect } from '@fixtures/test';
import type { LoginResponse } from '@services/auth.service';
import type { User } from '@services/users.service';
import type { Post, DeletedPost } from '@services/posts.service';

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

// --- Crear cuenta: el id que devuelve la consulta del cliente alimenta la creación ---

// Id de ejemplo fijo. No se pide como dato en el Gherkin ni se muestra en el
// reporte amigable — para quien lee el caso, lo que importa es que el
// cliente ya existe, no cuál número interno tiene.
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
// devuelve (ej. 252) no existe de verdad, así que buscarlo o borrarlo
// después da 404. Por eso este flujo usa una cuenta que sí existe en el
// banco (igual que "que existe un cliente registrado en el banco"), en vez
// de encadenarse con el escenario de creación.
const CUENTA_DEMO_ID = 2;

Given('que existe una cuenta registrada en el banco', async ({ postsService, ctx }) => {
  ctx.setResponse(await postsService.getById(CUENTA_DEMO_ID));
  ctx.setAccountId(ctx.response<Post>().data.id);
});

When('busco esa cuenta y la elimino', async ({ postsService, ctx }) => {
  // La búsqueda ("¿existe esto en la base de datos?") no es lo que se
  // valida en este step — lo que importa es la respuesta del DELETE.
  await postsService.getById(ctx.accountId());
  ctx.setResponse(await postsService.remove(ctx.accountId()));
});

Then('la cuenta queda marcada como eliminada', async ({ ctx }) => {
  const data = ctx.response<DeletedPost>().data;
  expect(data.isDeleted).toBe(true);
});

Then('vuelvo a consultarla para dejar evidencia de la validación', async ({ postsService, ctx }) => {
  // Esta API pública no persiste el DELETE (dummyjson.com solo lo simula),
  // así que esta consulta va a traer el mismo registro otra vez — no se
  // puede usar para probar que desapareció. Sirve para dejar la evidencia
  // de la consulta en el reporte; en Omnicanalidad este mismo step
  // consultaría la base de datos real para confirmar que ya no existe.
  const response = await postsService.getById(
    ctx.accountId(),
    'Volver a consultar la cuenta para dejar evidencia de la validación',
  );
  expect(response.status).toBe(200);
  ctx.setResponse(response);
});

// --- Caso negativo: credenciales inválidas ---
// Usa un texto de step distinto ("intento iniciar sesión... incorrecta") en
// vez de reutilizar el de login exitoso, para poder marcar la llamada como
// expectFailure y que el reporte no confunda "la API respondió con error"
// (correcto acá) con "el caso de prueba falló".

When(
  'intento iniciar sesión con el usuario {string} y la contraseña incorrecta {string}',
  async ({ authService, ctx }, username: string, password: string) => {
    ctx.setResponse(await authService.login(username, password, { expectFailure: true }));
  },
);

Then('el sistema rechaza el acceso por credenciales inválidas', async ({ ctx }) => {
  const response = ctx.response<LoginResponse>();
  // La API pública devuelve 400 con { message: "Invalid credentials" }.
  // Se valida con >= 400 (en vez del número exacto) para que el caso siga
  // siendo válido aunque el proveedor use 400 o 401 según el caso.
  expect(response.status).toBeGreaterThanOrEqual(400);
  expect((response.data as unknown as { accessToken?: string }).accessToken).toBeUndefined();
});
