# Omnicanalidad — POC de pruebas de API

Demo de metodología: Playwright + TypeScript + BDD para pruebas de **API**,
con arquitectura en capas, para mostrar el enfoque de automatización antes
de aplicarlo a los flujos reales de Omnicanalidad.

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

Cinco escenarios que cuentan una historia real de "encadenamiento de
servicios" — lo mismo que se va a documentar en el AS-IS de Omnicanalidad:

1. **Obtener un token de acceso al iniciar sesión** — se manda usuario y
   contraseña y la API devuelve un **token de acceso**. Este es el caso
   crítico (`@critical`): si esto no funciona, nada más funciona.
2. **Consultar mi perfil con el token obtenido** — el login es la
   **precondición** (el paso "Dado que..."); la prueba en sí es usar ese
   token en el header `Authorization` para consultar un endpoint protegido.
   Sin el token del paso anterior, esta llamada no funcionaría.
3. **Crear una cuenta para un cliente existente** — otra vez el login como
   precondición, y además se consulta un cliente que ya existe en el banco
   y se guarda su identificador; luego se crea una cuenta usando ese mismo
   identificador como dato de entrada. Es el patrón típico de "Test Data":
   una API le da a la otra el dato que necesita para poder ejecutarse.
4. **Rechazar el inicio de sesión con contraseña incorrecta** — caso
   negativo (`@negativo`): se manda una contraseña equivocada a propósito y
   se valida que el sistema *no* entregue un token. Un caso negativo que
   pasa (✅ verde) significa que el sistema protegió bien el acceso.
5. **Eliminar una cuenta existente** — login + una cuenta ya existente en
   el banco como precondición; el caso en sí la busca y manda un `DELETE`,
   y valida que la respuesta la marque como eliminada (`isDeleted: true`).
   Después hay un último paso que vuelve a consultarla "para dejar
   evidencia de la validación" — léase la nota de abajo, es importante.

   **Dos límites reales de dummyjson.com que valen la pena conocer, porque
   moldearon este escenario** (los descubrí corriendo la primera versión y
   viendo el test fallar, así que los dejo documentados para que no
   sorprendan en la próxima vuelta):
   - **Lo que crea `POST /posts/add` no queda guardado de verdad.** Por eso
     este caso *no* encadena con el escenario "Crear una cuenta..." — buscar
     o borrar el id que devuelve esa creación da 404, porque nunca existió
     de verdad del lado del servidor. Se usa en su lugar una cuenta que sí
     existe en el banco (el mismo patrón que ya usa "Crear una cuenta...").
   - **`DELETE` tampoco borra nada de verdad**, solo simula la respuesta
     (por eso el `Post` que devuelve trae `isDeleted: true`, pero si se
     vuelve a consultar el mismo id, sigue apareciendo). La única
     confirmación real que esta API puede dar es la que ya viene en la
     propia respuesta del `DELETE`, que es lo que se valida. El último paso
     (volver a consultar) se dejó igual porque representa el patrón que sí
     aplica en Omnicanalidad: ahí esa misma consulta se haría contra la base
     de datos real para confirmar que el registro ya no existe — con esta
     API pública no se puede demostrar eso de verdad, solo el patrón.

Cuando se definan los flujos reales de Omnicanalidad, este ejemplo se
reemplaza siguiendo la misma estructura (precondición de login → token →
llamada protegida → encadenamiento de datos entre servicios → casos
negativos → eliminar y validar).

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

  En el caso negativo, un status de error (400) es el resultado *correcto*,
  así que el resumen dice "rechazado correctamente ✅ (era el resultado
  esperado)" en vez de marcarlo como una falla.

## Cómo leer el reporte si no eres de QA (o vas a mostrarlo a alguien que no lo es)

- **Fondo oscuro / claro**: el reporte de Playwright trae su propio botón de
  tema (el ícono de engranaje/ajustes, arriba a la derecha de la pantalla,
  junto a la barra de búsqueda). No hay que configurar nada en el proyecto;
  ahí mismo se cambia entre claro y oscuro y queda guardado en el navegador.
- **Los nombres de los casos y los pasos ("Dado", "Cuando", "Entonces") ya
  están en español** — léelos como una historia: qué precondición había, qué
  se hizo, qué se esperaba que pasara.
- **"Before Hooks" se puede ignorar.** Es preparación interna de Playwright
  (arma las conexiones a los servicios antes de correr el caso) — siempre
  aparece, siempre es rápida, y no dice nada sobre lo que se probó. Lo que sí
  cuenta la historia es la sección debajo de eso: los pasos "Dado/Cuando/
  Entonces" y sus "Attachments".
- **Las etiquetas (`smoke`, `critical`, `negativo`) son solo para filtrar**:
  `smoke` = pruebas rápidas esenciales, `critical` = el paso del que depende
  todo lo demás, `negativo` = casos que deben fallar a propósito para
  confirmar que el sistema protege bien el acceso. El nombre del proyecto
  ("Omnicanalidad") es aparte — no es una etiqueta repetida.
- El resto de las palabras sueltas de la interfaz ("Run", "Test Steps",
  "Attachments", "stdout") son parte fija del reporte de Playwright y no se
  pueden traducir sin reescribir el reportero — no son parte de la prueba en
  sí, así que para explicarle esto a un no-técnico alcanza con leer los
  nombres de los escenarios y abrir los "Attachments".
- **Ambiente**: cada caso, al abrirlo en el reporte, muestra una línea
  "Ambiente: Prueba" junto al título — se lee de `AMBIENTE` en `.env` y sale
  sola en cada test, sin que cada escenario tenga que declararlo. Cuando este
  ejemplo apunte a un ambiente real de Omnicanalidad, basta con cambiar esa
  variable (`AMBIENTE=QA`, `AMBIENTE=Staging`...) para que el reporte lo
  refleje.
