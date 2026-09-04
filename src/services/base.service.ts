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
  /**
   * Marca esta llamada como un caso negativo: se espera que la API
   * responda con un error (ej. credenciales inválidas). Cambia el resumen
   * del adjunto para que un status no-2xx se lea como "rechazado
   * correctamente ✅" en vez de "no exitoso ❌", que confundiría a alguien
   * que no sea de QA (el test en verde ya dice que el caso pasó).
   */
  expectFailure?: boolean;
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
    const { config, description, expectFailure } = options;
    const url = `${this.client.defaults.baseURL}${path}`;
    console.log(`\n[API] → GET ${url}`);

    const response = await this.client.get<T>(path, config);

    console.log(`[API] ← ${response.status} ${response.statusText}`);
    console.log(`[API] respuesta:`, JSON.stringify(response.data, null, 2));

    await this.attachExchange('GET', url, undefined, response, description, expectFailure);

    return response;
  }

  protected async post<T>(
    path: string,
    body: unknown,
    options: CallOptions = {},
  ): Promise<AxiosResponse<T>> {
    const { config, description, expectFailure } = options;
    const url = `${this.client.defaults.baseURL}${path}`;
    console.log(`\n[API] → POST ${url}`);
    console.log(`[API] payload enviado:`, JSON.stringify(body, null, 2));

    const response = await this.client.post<T>(path, body, config);

    console.log(`[API] ← ${response.status} ${response.statusText}`);
    console.log(`[API] respuesta:`, JSON.stringify(response.data, null, 2));

    await this.attachExchange('POST', url, body, response, description, expectFailure);

    return response;
  }

  protected async delete<T>(path: string, options: CallOptions = {}): Promise<AxiosResponse<T>> {
    const { config, description, expectFailure } = options;
    const url = `${this.client.defaults.baseURL}${path}`;
    console.log(`\n[API] → DELETE ${url}`);

    const response = await this.client.delete<T>(path, config);

    console.log(`[API] ← ${response.status} ${response.statusText}`);
    console.log(`[API] respuesta:`, JSON.stringify(response.data, null, 2));

    await this.attachExchange('DELETE', url, undefined, response, description, expectFailure);

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
    expectFailure?: boolean,
  ): Promise<void> {
    try {
      const isSuccessStatus = response.status >= 200 && response.status < 300;
      // En un caso normal, un status 2xx es lo correcto. En un caso negativo
      // (expectFailure), es al revés: lo correcto es que la API rechace la
      // llamada, así que un status de error es la señal de que el caso pasó.
      const resultLine = expectFailure
        ? isSuccessStatus
          ? '⚠️ inesperado — la API aceptó una llamada que debía rechazar'
          : 'rechazado correctamente ✅ (era el resultado esperado)'
        : isSuccessStatus
          ? 'correcto ✅'
          : 'no exitoso ❌';

      const summary = [
        description ?? `Llamada ${method} a ${url}`,
        '',
        `Resultado: ${response.status} ${response.statusText} — ${resultLine}`,
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
