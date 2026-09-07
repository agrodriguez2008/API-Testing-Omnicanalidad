import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { test } from '@playwright/test';
import { env } from '@config/env';

export interface ServiceOptions {
  basePath?: string;
}

interface CallOptions {
  /** Config extra de axios para esta llamada (ej. headers de autenticacion). */
  config?: AxiosRequestConfig;
  /**
   * Descripcion en lenguaje de negocio de que hace esta llamada
   * (ej. "Iniciar sesion como 'emilys'"). Se usa como titulo del adjunto en
   * el reporte, para que cualquiera entienda que se probo sin leer codigo.
   */
  description?: string;
  /**
   * Marca esta llamada como un caso negativo: se espera que la API
   * responda con un error (ej. credenciales invalidas). Cambia el resumen
   * del adjunto para que un status no-2xx se lea como "rechazado
   * correctamente ✅" en vez de "no exitoso ❌", que confundiria a alguien
   * que no sea de QA (el test en verde ya dice que el caso paso).
   */
  expectFailure?: boolean;
}

/**
 * Unico punto del proyecto que importa axios. Cada servicio concreto
 * (AuthService, UsersService, PostsService...) hereda de aqui y solo mapea
 * endpoints a metodos. Las respuestas no-2xx se devuelven, nunca se lanzan
 * como excepcion — el step decide que es aceptable.
 *
 * Cada llamada queda registrada en dos lugares:
 * - consola (se ve corriendo `npm test`, y queda guardado en la seccion
 *   "stdout" de cada test dentro del reporte HTML)
 * - como adjunto ("Attachments") del test en el reporte, con un resumen en
 *   español facil de leer arriba, y el detalle tecnico (request/response
 *   completos) abajo — para que un no-tecnico entienda que se probo con solo
 *   leer el titulo y la primera linea, y alguien tecnico pueda ver el resto.
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
   * Nunca debe tumbar el test: si `test.info()` no esta disponible, se ignora.
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
      // (expectFailure), es al reves: lo correcto es que la API rechace la
      // llamada, asi que un status de error es la señal de que el caso paso.
      const resultLine = expectFailure
        ? isSuccessStatus
          ? '⚠ inesperado — la API acepto una llamada que debia rechazar'
          : 'rechazado correctamente ✅ (era el resultado esperado)'
        : isSuccessStatus
          ? 'correcto ✅'
          : 'no exitoso ❌';

      const summary = [
        description ?? `Llamada ${method} a ${url}`,
        '',
        `Resultado: ${response.status} ${response.statusText} — ${resultLine}`,
        '',
        '--- Detalle tecnico ---',
        `${method} ${url}`,
        '',
        'Lo que se envio:',
        requestBody ? JSON.stringify(requestBody, null, 2) : '(sin datos, es una consulta)',
        '',
        'Lo que respondio la API:',
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

  /**
   * Deja como evidencia en el reporte una consulta SQL armada para
   * representar el paso de "entrar a la base de datos del banco" en las
   * presentaciones. Este proyecto usa dummyjson.com (API publica de
   * practica) como fuente de datos, no una base de datos SQL real, asi que
   * el SQL es ilustrativo -- lo que se valida despues (la llamada real que
   * sigue a este adjunto) si es un dato real devuelto por la API.
   */
  protected async attachSqlQuery(sql: string, description: string): Promise<void> {
    console.log(`\n[DB] ${description}`);
    console.log(`[DB] ${sql}`);
    try {
      const summary = [
        description,
        '',
        'Consulta SQL:',
        sql,
        '',
        '--- Detalle tecnico ---',
        'Este proyecto usa dummyjson.com (API publica de practica) como fuente',
        'de datos y no tiene una base de datos SQL real detras -- este SQL se',
        'arma para ilustrar el paso tal como se veria contra la base de datos',
        'real del banco. El resultado que se valida en el siguiente adjunto si',
        'es un dato real, devuelto por la API.',
      ].join('\n');

      await test.info().attach(description, { body: summary, contentType: 'text/plain' });
    } catch {
      /* la evidencia nunca debe hacer fallar un test */
    }
  }
}
