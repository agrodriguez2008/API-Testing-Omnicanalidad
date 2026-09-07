# Omnicanalidad — POC de pruebas de API

Demo de metodologia: Playwright + TypeScript + BDD para pruebas de **API**,
con arquitectura en capas, para mostrar el enfoque de automatizacion antes
de aplicarlo a los flujos reales de Omnicanalidad.

Este proyecto es 100% API — no abre navegador ni depende de ninguna pantalla.

## Por que esta organizado asi

- `features/` — el comportamiento esperado, en Gherkin (lenguaje de negocio,
  sin codigo ni URLs de endpoints). Un `.feature` por funcionalidad de
  negocio (`autenticacion.feature`, `cuentas.feature`...), no uno por
  escenario -- cada uno agrupa los escenarios que prueban esa funcionalidad.
- `steps/` — traduce cada linea del Gherkin a una llamada de intencion sobre
  un Service. Nunca toca `axios` directamente. Los archivos de `steps/`
  siguen la misma division por funcionalidad que `features/`, pero son una
  libreria compartida: un step definido en `autenticacion.steps.ts` (como el
  login, que se usa como precondicion en casi todos los casos) se puede usar
  desde cualquier `.feature`, no solo desde `autenticacion.feature`.
- `src/services/` — clientes de API. Saben como hablar con el backend;
  nunca lanzan excepcion por un status no-2xx, lo devuelven como dato.
- `src/fixtures/test.ts` — el unico lugar del proyecto donde se construye
  algo. Conecta steps con Services.
- `src/config/env.ts` — configuracion tipada y centralizada, leida de `.env`.

## Correr

```bash
npm install
cp .env.example .env      # en PowerShell: Copy-Item .env.example .env
npm test
```

## Que prueba (ejemplo con dummyjson.com, API publica de practica)

Seis escenarios repartidos en dos `.feature`, que cuentan una historia real
de "encadenamiento de servicios" — lo mismo que se va a documentar en el
AS-IS de Omnicanalidad. Se dividieron por funcionalidad, no por escenario:
todo lo que prueba el login en si va en `autenticacion.feature`; todo lo que
usa el login solo como precondicion para trabajar con cuentas va en
`cuentas.feature`.

### `features/autenticacion.feature`

1. **Obtener token de acceso - Precondicion para los demas casos** — se
   manda el usuario y la clave de prueba (leidos de `.env`, no escritos en
   el escenario) y la API devuelve un **token de acceso**. Este es el caso
   critico (`@critical`): si esto no funciona, nada mas funciona.
2. **Consultar el perfil del cliente autenticado usando el token** — el
   login es la **precondicion** (el paso "Dado que..."); la prueba en si es
   usar ese token en el header `Authorization` para consultar un endpoint
   protegido. Sin el token del paso anterior, esta llamada no funcionaria.
3. **Prueba negativa - No se puede iniciar sesion con contraseña
   incorrecta** — caso negativo (`@negativo`): se usa el usuario de prueba
   pero con una clave equivocada a proposito (esta si esta escrita en el
   codigo, porque es un dato que a proposito no debe funcionar nunca — no es
   un dato real del ambiente) y se valida que el sistema *no* entregue un
   token. Un caso negativo que pasa (✅ verde) significa que el sistema
   protegio bien el acceso.

### `features/cuentas.feature`

Cada uno de estos usa el login como precondicion (el mismo paso "Dado que
inicie sesion con el usuario de prueba" de arriba, definido una sola vez en
`steps/autenticacion.steps.ts` y reutilizado aqui):

1. **Crear una cuenta para un cliente existente** — se consulta un cliente
   que ya existe en el banco y se guarda su identificador; luego se crea
   una cuenta usando ese mismo identificador como dato de entrada. Es el
   patron tipico de "Test Data": una API le da a la otra el dato que
   necesita para poder ejecutarse.
2. **Eliminar una cuenta existente - evitar creacion de multiple data
   dummy** — una cuenta ya existente en el banco como precondicion; el caso
   en si la busca y manda un `DELETE`, y valida que la respuesta la marque
   como eliminada (`isDeleted: true`). Despues hay un ultimo paso que vuelve
   a consultarla "para dejar evidencia de la validacion" — lease la nota de
   abajo, es importante.

   **Dos limites reales de dummyjson.com que valen la pena conocer, porque
   moldearon este escenario** (los descubri corriendo la primera version y
   viendo el test fallar, asi que los dejo documentados para que no
   sorprendan en la proxima vuelta):
   - **Lo que crea `POST /posts/add` no queda guardado de verdad**, asi que
     este caso, a pesar del nombre, *no puede* encadenarse literalmente con
     la cuenta del escenario "Crear una cuenta para un cliente existente" —
     buscar o borrar el id que devuelve esa creacion da 404, porque nunca
     existio de verdad del lado del servidor. Usa en su lugar una cuenta que
     si existe en el banco. Es, de hecho, la misma idea detras del nombre
     del caso: reutilizar una cuenta existente en vez de crear una nueva
     solo para borrarla es justo lo que evita acumular data dummy de mas.
     En Omnicanalidad, con datos que si persisten, este mismo caso si
     podria encadenarse literalmente con la cuenta recien creada.
   - **`DELETE` tampoco borra nada de verdad**, solo simula la respuesta
     (por eso el `Post` que devuelve trae `isDeleted: true`, pero si se
     vuelve a consultar el mismo id, sigue apareciendo). La unica
     confirmacion real que esta API puede dar es la que ya viene en la
     propia respuesta del `DELETE`, que es lo que se valida. El ultimo paso
     (volver a consultar) se dejo igual porque representa el patron que si
     aplica en Omnicanalidad: ahi esa misma consulta se haria contra la base
     de datos real para confirmar que el registro ya no existe — con esta
     API publica no se puede demostrar eso de verdad, solo el patron.
3. **Buscar una cuenta existente en la base de datos** — caso propio y
   visible para la busqueda, separado del de eliminar: la accion que se
   prueba es solo consultar una cuenta que existe, validando que se reciben
   sus datos completos. (La busqueda que hace el escenario de eliminar
   antes de borrar es interna a ese paso; este caso la deja como su propio
   "Cuando ... Entonces", con su propia validacion.)

   Para las presentaciones, este paso deja ver primero, como su propio
   adjunto en el reporte, un `SELECT * FROM cuentas WHERE id = ...` armado
   para representar el ingreso a la base de datos del banco, y recien
   despues trae el dato real (siguiente adjunto). dummyjson.com no tiene una
   base de datos SQL real detras -- el SQL es ilustrativo, pero el dato que
   se valida si es real, devuelto por la API. Cuando esto apunte a la base
   de datos real de Omnicanalidad, este mismo paso podria hacer la consulta
   SQL de verdad en vez de simularla.

Cuando se definan los flujos reales de Omnicanalidad, este ejemplo se
reemplaza siguiendo la misma estructura (precondicion de login → token →
llamada protegida → encadenamiento de datos entre servicios → casos
negativos → eliminar y validar).

## Ver el log y el resultado de cada llamada

Cada request/respuesta queda registrado en dos lugares:

- **Terminal** — se imprime en vivo al correr `npm test`: metodo, URL,
  payload enviado, status y la respuesta completa.
- **Reporte HTML** (`npx playwright show-report`) — cada test tiene una
  seccion **"Attachments"**. Ahi cada llamada aparece con un titulo en
  español que dice que se hizo (ej. *"Iniciar sesion como 'emilys'"*), y al
  abrirla se ve primero un resumen en lenguaje simple (que se hizo y si salio
  bien) y abajo el detalle tecnico completo (lo que se envio y lo que
  respondio la API). Asi alguien sin conocimiento de automatizacion entiende
  que se probo con solo leer el titulo y la primera linea.

  En el caso negativo, un status de error (400) es el resultado *correcto*,
  asi que el resumen dice "rechazado correctamente ✅ (era el resultado
  esperado)" en vez de marcarlo como una falla.

## Como leer el reporte si no eres de QA (o vas a mostrarlo a alguien que no lo es)

- **Fondo oscuro / claro**: el reporte de Playwright trae su propio boton de
  tema (el icono de engranaje/ajustes, arriba a la derecha de la pantalla,
  junto a la barra de busqueda). No hay que configurar nada en el proyecto;
  ahi mismo se cambia entre claro y oscuro y queda guardado en el navegador.
- **Los nombres de los casos y los pasos ("Dado", "Cuando", "Entonces") ya
  estan en español** — leelos como una historia: que precondicion habia, que
  se hizo, que se esperaba que pasara.
- **"Before Hooks" se puede ignorar.** Es preparacion interna de Playwright
  (arma las conexiones a los servicios antes de correr el caso) — siempre
  aparece, siempre es rapida, y no dice nada sobre lo que se probo. Lo que si
  cuenta la historia es la seccion debajo de eso: los pasos "Dado/Cuando/
  Entonces" y sus "Attachments".
- **Las etiquetas (`smoke`, `critical`, `negativo`) son solo para filtrar**:
  `smoke` = pruebas rapidas esenciales, `critical` = el paso del que depende
  todo lo demas, `negativo` = casos que deben fallar a proposito para
  confirmar que el sistema protege bien el acceso. El nombre del proyecto
  ("API Omnicanalidad Banco Banrural") es aparte — no es una
  etiqueta repetida.
- El resto de las palabras sueltas de la interfaz ("Project:", "Run", "Test
  Steps", "Attachments", "stdout") son parte fija del reporte de Playwright
  y no se pueden traducir sin reescribir el reportero — no son parte de la
  prueba en si. Lo que sigue despues de "Project:" (el nombre del proyecto)
  si es 100% nuestro y ya esta en español. Para explicarle esto a un
  no-tecnico alcanza con leer los nombres de los escenarios y abrir los
  "Attachments".
- **Ambiente**: cada caso, al abrirlo en el reporte, muestra una linea
  "Ambiente: Pre produccion" junto al titulo — se lee de `AMBIENTE` en
  `.env` y sale sola en cada test, sin que cada escenario tenga que
  declararlo. Cuando este ejemplo apunte a otro ambiente, basta con cambiar
  esa variable (`AMBIENTE=QA`, `AMBIENTE=Staging`...) para que el reporte lo
  refleje.
- **Usuario y clave de prueba**: tambien viven en `.env`
  (`USUARIO_PRUEBA` / `CLAVE_PRUEBA`), no en el `.feature` ni en el codigo.
  La idea es que ese dato quede ligado al ambiente contra el que se corre,
  no al caso de prueba: el usuario "emilys" es valido en este ambiente
  publico de practica, pero en Omnicanalidad cada ambiente (Pre produccion,
  QA...) va a tener su propio usuario de prueba, y basta con cambiar esas
  dos lineas en `.env` para correr los mismos escenarios contra otro
  ambiente, sin tocar ni el Gherkin ni el codigo.
