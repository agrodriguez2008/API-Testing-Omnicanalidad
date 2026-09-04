import type { AxiosResponse } from 'axios';

/**
 * Estado compartido entre steps de UN escenario. Se crea una instancia nueva
 * por escenario (fixture `ctx`), así que nada se filtra entre workers en paralelo.
 */
export class ScenarioContext {
  private lastResponse?: AxiosResponse;

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
}
