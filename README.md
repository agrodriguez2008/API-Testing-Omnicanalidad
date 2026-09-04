# playwright-bdd-poc

Demo de metodología: Playwright + TypeScript + BDD para pruebas de **API**,
con arquitectura en capas, para mostrar el enfoque de automatización antes
de aplicarlo a los flujos reales del cliente.

Este proyecto es 100% API — no abre navegador ni depende de ninguna pantalla.

## Por qué está organizado así

- `features/` — el comportamiento esperado, en Gherkin (lenguaje de negocio,
  sin código ni URLs de endpoints).
- `steps/` — traduce cada línea del Gherkin a una llamada de intención sobre
  un Service. Nunca toca `axios` directamente.
- `src/services/` — clientes de API. Saben cómo hablar con el backend;
  nunca lanzan excepción por un status no-2xx, lo devuelven como dato.
- `src/fixtures/test.ts` — el único lugar del proyecto donde se construye
  algo. Conecta steps con Services.
- `src/config/env.ts` — configuración tipada y centralizada, leída de `.env`.

## Correr

```bash
npm install
cp .env.example .env      # en PowerShell: Copy-Item .env.example .env
npm test
```

## Qué prueba (ejemplo con dummyjson.com, API pública de práctica)

Tres escenarios que cuentan una historia real de "encadenamiento de
servicios" — lo mismo que se va a documentar en el AS-IS de Omnicanalidad:

1. **Login** — se manda usuario/contraseña y la API devuelve un **token de
   acceso**.
2. **Usar el token** — ese token se manda en el header `Authorization` para
   consultar un endpoint protegido (`/auth/me`). Sin el token de paso 1, esta
   llamada no funcionaría.
3. **Encadenar un id entre dos APIs** — primero se consulta un usuario
   (`GET /users/1`) y se guarda su `id`; luego se crea una publicación
   (`POST /posts/add`) usando ese mismo `id` como dato de entrada. Es el
   patrón típico de "Test Data": una API le da a la otra el dato que necesita
   para poder ejecutarse.

Cuando se definan los flujos reales de Omnicanalidad, este ejemplo se
reemplaza siguiendo la misma estructura (login → token → llamada protegida →
encadenamiento de datos entre servicios).

## Ver el log y el resultado de cada llamada

Cada request/respuesta queda registrado en dos lugares:

- **Terminal** — se imprime en vivo al correr `npm test`: método, URL,
  payload enviado, status y la respuesta completa.
- **Reporte HTML** (`npx playwright show-report`) — cada test tiene una
  sección **"Attachments"**. Ahí cada llamada aparece con un título en
  español que dice qué se hizo (ej. *"Iniciar sesión como 'emilys'"*), y al
  abrirla se ve primero un resumen en lenguaje simple (qué se hizo y si salió
  bien) y abajo el detalle técnico completo (lo que se envió y lo que
  respondió la API). Así alguien sin conocimiento de automatización entiende
  qué se probó con solo leer el título y la primera línea.

  Nota: el resto de la interfaz del reporte ("Test Steps", "Before Hooks",
  "Attachments", "stdout") viene en inglés porque es la interfaz propia de
  Playwright — no es algo que se pueda traducir sin reescribir el reportero.
  Para la presentación al cliente, lo más claro es mostrar el nombre del
  escenario (ya en español) y abrir directamente esos adjuntos.
