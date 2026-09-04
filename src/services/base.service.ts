import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
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
 * También deja un log de cada llamada (URL, payload enviado, status y
 * respuesta) en la consola, para poder ver exactamente qué se mandó y qué
 * contestó la API cuando corre `npm test`.
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

    return response;
  }

  protected async post<T>(path: string, body: unknown): Promise<AxiosResponse<T>> {
    const url = `${this.client.defaults.baseURL}${path}`;
    console.log(`\n[API] → POST ${url}`);
    console.log(`[API] payload enviado:`, JSON.stringify(body, null, 2));

    const response = await this.client.post<T>(path, body);

    console.log(`[API] ← ${response.status} ${response.statusText}`);
    console.log(`[API] respuesta:`, JSON.stringify(response.data, null, 2));

    return response;
  }
}
