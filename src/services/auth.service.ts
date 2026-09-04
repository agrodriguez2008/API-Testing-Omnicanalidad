import type { AxiosResponse } from 'axios';
import { BaseService } from './base.service';

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  accessToken: string;
  refreshToken: string;
}

/** Login y perfil autenticado. Ejemplo de: token que se obtiene de una API y se usa en otra. */
export class AuthService extends BaseService {
  constructor() {
    super({ basePath: '/auth' });
  }

  login(username: string, password: string): Promise<AxiosResponse<LoginResponse>> {
    return this.post<LoginResponse>(
      '/login',
      { username, password },
      { description: `Iniciar sesión en la banca en línea como "${username}"` },
    );
  }

  me(token: string): Promise<AxiosResponse<LoginResponse>> {
    return this.get<LoginResponse>('/me', {
      config: { headers: { Authorization: `Bearer ${token}` } },
      description: 'Consultar mi perfil de cliente usando el token que devolvió el login',
    });
  }
}
