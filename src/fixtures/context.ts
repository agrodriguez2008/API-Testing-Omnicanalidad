import type { AxiosResponse } from 'axios';

/**
 * Estado compartido entre steps de UN escenario. Se crea una instancia nueva
 * por escenario (fixture `ctx`), así que nada se filtra entre workers en paralelo.
 */
export class ScenarioContext {
  private lastResponse?: AxiosResponse;
  private accessToken?: string;
  private lastUserId?: number;
  private lastAccountId?: number;

  setResponse(response: AxiosResponse): void {
    this.lastResponse = response;
  }

  response<T = unknown>(): AxiosResponse<T> {
    if (!this.lastResponse) {
      throw new Error(
        'No hay ninguna respuesta guardada todavía. ¿Corrió un "When" antes de este "Then"?',
      );
    }
    return this.lastResponse as AxiosResponse<T>;
  }

  /** Guarda el token que devolvió el login, para que otro step lo use después. */
  setToken(token: string): void {
    this.accessToken = token;
  }

  token(): string {
    if (!this.accessToken) {
      throw new Error('No hay token guardado. ¿Corrió el login antes que este step?');
    }
    return this.accessToken;
  }

  /** Guarda un id devuelto por una API, para que otra llamada lo use como dato. */
  setUserId(id: number): void {
    this.lastUserId = id;
  }

  userId(): number {
    if (this.lastUserId === undefined) {
      throw new Error('No hay id de usuario guardado. ¿Corrió el step que lo obtiene antes?');
    }
    return this.lastUserId;
  }

  /** Guarda el id de la cuenta creada, para poder buscarla/eliminarla después. */
  setAccountId(id: number): void {
    this.lastAccountId = id;
  }

  accountId(): number {
    if (this.lastAccountId === undefined) {
      throw new Error('No hay id de cuenta guardado. ¿Corrió el step que la crea antes?');
    }
    return this.lastAccountId;
  }
}
