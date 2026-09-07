import type { AxiosResponse } from 'axios';

/**
 * Estado compartido entre steps de UN escenario. Se crea una instancia nueva
 * por escenario (fixture `ctx`), asi que nada se filtra entre workers en paralelo.
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
        'No hay ninguna respuesta guardada todavia. ¿Corrio un "When" antes de este "Then"?',
      );
    }
    return this.lastResponse as AxiosResponse<T>;
  }

  /** Guarda el token que devolvio el login, para que otro step lo use despues. */
  setToken(token: string): void {
    this.accessToken = token;
  }

  token(): string {
    if (!this.accessToken) {
      throw new Error('No hay token guardado. ¿Corrio el login antes que este step?');
    }
    return this.accessToken;
  }

  /** Guarda un id devuelto por una API, para que otra llamada lo use como dato. */
  setUserId(id: number): void {
    this.lastUserId = id;
  }

  userId(): number {
    if (this.lastUserId === undefined) {
      throw new Error('No hay id de usuario guardado. ¿Corrio el step que lo obtiene antes?');
    }
    return this.lastUserId;
  }

  /** Guarda el id de la cuenta creada, para poder buscarla/eliminarla despues. */
  setAccountId(id: number): void {
    this.lastAccountId = id;
  }

  accountId(): number {
    if (this.lastAccountId === undefined) {
      throw new Error('No hay id de cuenta guardado. ¿Corrio el step que la crea antes?');
    }
    return this.lastAccountId;
  }
}
