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
 */
export abstract class BaseService {
  protected readonly client: AxiosInstance;

  constructor(options: ServiceOptions = {}) {
    this.client = axios.create({
      baseURL: env.apiUrl + (options.basePath ?? ''),
      validateStatus: () => true,
    });
  }

  protected get<T>(path: string): Promise<AxiosResponse<T>> {
    return this.client.get<T>(path);
  }

  protected post<T>(path: string, body: unknown): Promise<AxiosResponse<T>> {
    return this.client.post<T>(path, body);
  }
}
