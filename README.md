# playwright-bdd-poc

Demo de metodología: Playwright + TypeScript + BDD, con arquitectura en capas,
para mostrar el enfoque de automatización antes de aplicarlo a los flujos
reales del cliente.

## Por qué está organizado así

- `features/` — el comportamiento esperado, en Gherkin (lenguaje de negocio,
  sin selectores ni código).
- `steps/` — traduce cada línea del Gherkin a una llamada de intención sobre
  un Page Object o un Service. Nunca toca `page` ni `axios` directamente.
- `src/pages/` — Page Objects de UI. Saben dónde están los controles;
  exponen intención (`signInAs`), nunca selectores sueltos.
- `src/services/` — clientes de API. Saben cómo hablar con el backend;
  nunca lanzan excepción por un status no-2xx, lo devuelven como dato.
- `src/fixtures/test.ts` — el único lugar del proyecto donde se construye
  algo. Conecta steps con Page Objects/Services.
- `src/config/env.ts` — configuración tipada y centralizada, leída de `.env`.

Esta separación es la misma idea que usa el framework base del equipo: cuando
cambia una pantalla o un endpoint real, se toca un solo archivo, no todos los
tests.

## Correr

```bash
npm install
cp .env.example .env      # en PowerShell: Copy-Item .env.example .env
npm test                  # todo
npm run test:ui           # solo UI (login)
npm run test:api          # solo API (posts), sin navegador
```

## Qué prueba (solo de ejemplo, sitios públicos de práctica)

- **UI** — login en Swag Labs (saucedemo.com): usuario válido y usuario
  bloqueado.
- **API** — jsonplaceholder.typicode.com: consultar un post y crear uno
  nuevo.

Cuando se definan los flujos reales de Omnicanalidad, estos dos ejemplos se
reemplazan siguiendo la misma estructura.
