import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { test } from '@playwright/test';
import { env } from '@config/env';

export interface ServiceOptions {
  basePath?: string;
}

/**
 * Único punto del proyecto que importa axios. Cada servicio concreto
 * (PostsService, etc.) hereda de aquí y solo mapea endpoints a métodos.
 * Las respuestas no-2xx se devuelven, nunca se lanzan como excepción —
 * el step decide qué es aceptable.
 *
 * Cada llamada queda registrada en dos lugares:
 * - consola (se ve corriendo `npm test` y también queda guardado en la
 *   sección "stdout" de cada test dentro del reporte HTML)
 * - como adjunto ("Attachments") del test en el reporte HTML, con el
 *   request y la respuesta completos en JSON — para revisar sin tener que
 *   volver a correr las pruebas.
 */
export abstract class BaseService {
  protected readonly client: AxiosInstance;

  constructor(options: ServiceOptions = {}) {
    this.client = axios.create({
      baseURL: env.apiUrl + (options.basePath ?? ''),
      validateStatus: () => true,
    });
  }

  protected async get<T>(path: string): Promise<AxiosResponse<T>> {
    const url = `${this.client.defaults.baseURL}${path}`;
    console.log(`\n[API] → GET ${url}`);

    const response = await this.client.get<T>(path);

    console.log(`[API] ← ${response.status} ${response.statusText}`);
    console.log(`[API] respuesta:`, JSON.stringify(response.data, null, 2));

    await this.attachExchange('GET', url, undefined, response);

    return response;
  }

  protected async post<T>(path: string, body: unknown): Promise<AxiosResponse<T>> {
    const url = `${this.client.defaults.baseURL}${path}`;
    console.log(`\n[API] → POST ${url}`);
    console.log(`[API] payload enviado:`, JSON.stringify(body, null, 2));

    const response = await this.client.post<T>(path, body);

    console.log(`[API] ← ${response.status} ${response.statusText}`);
    console.log(`[API] respuesta:`, JSON.stringify(response.data, null, 2));

    await this.attachExchange('POST', url, body, response);

    return response;
  }

  /**
   * Adjunta el request/response al reporte de Playwright. Nunca debe tumbar
   * el test: si `test.info()` no está disponible por alguna razón, se ignora.
   */
  private async attachExchange(
    method: string,
    url: string,
    requestBody: unknown,
    response: AxiosResponse,
  ): Promise<void> {
    try {
      const exchange = {
        request: { method, url, body: requestBody ?? null },
        response: {
          status: response.status,
          statusText: response.statusText,
          body: response.data,
        },
      };
      await test.info().attach(`${method} ${url}`, {
        body: JSON.stringify(exchange, null, 2),
        contentType: 'application/json',
      });
    } catch {
      /* la evidencia nunca debe hacer fallar un test */
    }
  }
}
