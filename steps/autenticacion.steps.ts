import { Given, When, Then, expect } from '@fixtures/test';
import { env } from '@config/env';
import type { LoginResponse } from '@services/auth.service';

// --- Login y token ---
// El usuario y la clave NO estan escritos aqui ni en el .feature: se leen de
// `env.usuarioPrueba` / `env.clavePrueba` (que a su vez vienen de USUARIO_PRUEBA
// / CLAVE_PRUEBA en .env). Asi el dato queda ligado al ambiente, no al caso
// de prueba - si esto corre contra otro ambiente, se cambia el .env y listo.
//
// El step "Given" de abajo ("que inicie sesion...") vive aqui, no en
// cuentas.steps.ts, porque las definiciones de step son una libreria
// compartida entre TODOS los .feature -- no hace falta que vivan en el
// mismo archivo que el escenario que las usa. cuentas.feature lo usa como
// precondicion sin tener que redefinirlo.

When('inicio sesion con el usuario de prueba', async ({ authService, ctx }) => {
  ctx.setResponse(await authService.login(env.usuarioPrueba, env.clavePrueba));
});

Then('obtengo un token de acceso valido', async ({ ctx }) => {
  const data = ctx.response<LoginResponse>().data;
  expect(data.accessToken).toBeTruthy();
});

Given('que inicie sesion con el usuario de prueba', async ({ authService, ctx }) => {
  ctx.setResponse(await authService.login(env.usuarioPrueba, env.clavePrueba));
  ctx.setToken(ctx.response<LoginResponse>().data.accessToken);
});

When('consulto mi perfil usando ese token', async ({ authService, ctx }) => {
  ctx.setResponse(await authService.me(ctx.token()));
});

Then('veo los datos del usuario de prueba', async ({ ctx }) => {
  const data = ctx.response<LoginResponse>().data;
  expect(data.username).toBe(env.usuarioPrueba);
});

// --- Caso negativo: credenciales invalidas ---
// Usa un texto de step distinto ("intento iniciar sesion... incorrecta") en
// vez de reutilizar el de login exitoso, para poder marcar la llamada como
// expectFailure y que el reporte no confunda "la API respondio con error"
// (correcto aca) con "el caso de prueba fallo".

When(
  'intento iniciar sesion con el usuario de prueba y una contraseña incorrecta',
  async ({ authService, ctx }) => {
    // Aca si se hardcodea una clave a proposito: es una clave que NO debe
    // funcionar nunca, no un dato real del ambiente, asi que no tiene
    // sentido moverla al .env.
    ctx.setResponse(
      await authService.login(env.usuarioPrueba, 'clave-incorrecta', { expectFailure: true }),
    );
  },
);

Then('el sistema rechaza el acceso por credenciales invalidas', async ({ ctx }) => {
  const response = ctx.response<LoginResponse>();
  // La API publica devuelve 400 con { message: "Invalid credentials" }.
  // Se valida con >= 400 (en vez del numero exacto) para que el caso siga
  // siendo valido aunque el proveedor use 400 o 401 segun el caso.
  expect(response.status).toBeGreaterThanOrEqual(400);
  expect((response.data as unknown as { accessToken?: string }).accessToken).toBeUndefined();
});
