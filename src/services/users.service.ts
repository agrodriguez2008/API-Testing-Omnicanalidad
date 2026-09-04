import type { AxiosResponse } from 'axios';
import { BaseService } from './base.service';

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
}

/** Ejemplo de: una API cuyo id de respuesta alimenta la llamada de otra API. */
export class UsersService extends BaseService {
  constructor() {
    super({ basePath: '/users' });
  }

  getById(id: number): Promise<AxiosResponse<User>> {
    return this.get<User>(`/${id}`, { description: 'Consultar los datos del cliente en el banco' });
  }
}
