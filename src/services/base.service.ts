import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { test } from '@playwright/test';
import { env } from '@config/env';

export interface ServiceOptions {
  basePath?: string;
}

interface CallOptions {
  /** Config extra de axios para esta llamada (ej. headers de autenticación). */
  config?: AxiosRequestConfig;
  /**
   * Descripción en lenguaje de negocio de qué hace esta llamada
   * (ej. "Iniciar sesión como 'emilys'"). Se usa como título del adjunto en
   * el reporte, para que cualquiera entienda qué se probó sin leer código.
   */
  description?: string;
}

/**
 * Único punto del proyecto que importa axios. Cada servicio concreto
 * (AuthService, UsersService, PostsService...) hereda de aquí y solo mapea
 * endpoints a métodos. Las respuestas no-2xx se devuelven, nunca se lanzan
 * como excepción — el step decide qué es aceptable.
 *
 * Cada llamada queda registrada en dos lugares:
 * - consola (se ve corriendo `npm test`, y queda guardado en la sección
 *   "stdout" de cada test dentro del reporte HTML)
 * - como adjunto ("Attachments") del test en el reporte, con un resumen en
 *   español fácil de leer arriba, y el detalle técnico (request/response
 *   completos) abajo — para que un no-técnico entienda qué se probó con solo
 *   leer el título y la primera línea, y alguien técnico pueda ver el resto.
 */
export abstract class BaseService {
  protected readonly client: AxiosInstance;

  constructor(options: ServiceOptions = {}) {
    this.client = axios.create({
      baseURL: env.apiUrl + (options.basePath ?? ''),
      validateStatus: () => true,
    });
  }

  protected async get<T>(path: string, options: CallOptions = {}): Promise<AxiosResponse<T>> {
    const { config, description } = options;
    const url = `${this.client.defaults.baseURL}${path}`;
    console.log(`\n[API] → GET ${url}`);

    const response = await this.client.get<T>(path, config);

    console.log(`[API] ← ${response.status} ${response.statusText}`);
    console.log(`[API] respuesta:`, JSON.stringify(response.data, null, 2));

    await this.attachExchange('GET', url, undefined, response, description);

    return response;
  }

  protected async post<T>(
    path: string,
    body: unknown,
    options: CallOptions = {},
  ): Promise<AxiosResponse<T>> {
    const { config, description } = options;
    const url = `${this.client.defaults.baseURL}${path}`;
    console.log(`\n[API] → POST ${url}`);
    console.log(`[API] payload enviado:`, JSON.stringify(body, null, 2));

    const response = await this.client.post<T>(path, body, config);

    console.log(`[API] ← ${response.status} ${response.statusText}`);
    console.log(`[API] respuesta:`, JSON.stringify(response.data, null, 2));

    await this.attachExchange('POST', url, body, response, description);

    return response;
  }

  /**
   * Adjunta un resumen legible del request/response al reporte de Playwright.
   * Nunca debe tumbar el test: si `test.info()` no está disponible, se ignora.
   */
  private async attachExchange(
    method: string,
    url: string,
    requestBody: unknown,
    response: AxiosResponse,
    description?: string,
  ): Promise<void> {
    try {
      const ok = response.status >= 200 && response.status < 300;
      const summary = [
        description ?? `Llamada ${method} a ${url}`,
        '',
        `Resultado: ${response.status} ${response.statusText} — ${ok ? 'correcto ✅' : 'no exitoso ❌'}`,
        '',
        '--- Detalle técnico ---',
        `${method} ${url}`,
        '',
        'Lo que se envió:',
        requestBody ? JSON.stringify(requestBody, null, 2) : '(sin datos, es una consulta)',
        '',
        'Lo que respondió la API:',
        JSON.stringify(response.data, null, 2),
      ].join('\n');

      await test.info().attach(description ?? `${method} ${url}`, {
        body: summary,
        contentType: 'text/plain',
      });
    } catch {
      /* la evidencia nunca debe hacer fallar un test */
    }
  }
}
