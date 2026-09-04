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

## Ver el log de cada llamada

Cada request/respuesta queda registrado en dos lugares:

- **Terminal** — se imprime en vivo al correr `npm test`: método, URL,
  payload enviado, status y la respuesta completa.
- **Reporte HTML** (`npx playwright show-report`) — cada test tiene una
  sección **"Attachments"** con el request y la respuesta en JSON, y
  también la sección "stdout" con el mismo log de consola. No hace falta
  volver a correr las pruebas para revisar qué se mandó y qué contestó
  la API.

## Qué prueba (solo de ejemplo, sitio público de práctica)

**API** — jsonplaceholder.typicode.com: consultar un post y crear uno nuevo.

Cuando se definan los flujos reales de Omnicanalidad, este ejemplo se
reemplaza siguiendo la misma estructura.
