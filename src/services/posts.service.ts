import type { AxiosResponse } from 'axios';
import { BaseService } from './base.service';

export interface Post {
  id: number;
  title: string;
  userId: number;
}

export type NewPost = Omit<Post, 'id'>;

/**
 * dummyjson.com simula el DELETE: no borra nada de verdad, solo devuelve el
 * registro con estos dos campos agregados. Es la unica confirmacion de
 * "eliminado" que esta API publica puede dar.
 */
export interface DeletedPost extends Post {
  isDeleted: boolean;
  deletedOn: string;
}

/** Cliente de ejemplo para /posts en dummyjson.com. */
export class PostsService extends BaseService {
  constructor() {
    super({ basePath: '/posts' });
  }

  create(post: NewPost): Promise<AxiosResponse<Post>> {
    return this.post<Post>('/add', post, {
      description: 'Abrir una cuenta bancaria para el cliente',
    });
  }

  getById(
    id: number,
    description = 'Buscar la cuenta en el banco',
  ): Promise<AxiosResponse<Post>> {
    return this.get<Post>(`/${id}`, { description });
  }

  /**
   * Version del `getById` de arriba pensada para las presentaciones: antes
   * de traer la cuenta, deja como evidencia en el reporte un `SELECT`
   * ilustrativo, como si el paso fuera entrar directo a la base de datos
   * SQL del banco. Ver la nota en `attachSqlQuery` (base.service.ts) --
   * dummyjson.com no tiene una base de datos SQL real detras, asi que el
   * SQL es solo para representar el patron; el dato que se valida despues
   * si es real.
   */
  async buscarEnBaseDeDatos(id: number, tabla = 'cuentas'): Promise<AxiosResponse<Post>> {
    const sql = `SELECT * FROM ${tabla} WHERE id = ${id};`;
    await this.attachSqlQuery(sql, `Consultar la base de datos del banco (tabla "${tabla}")`);
    return this.getById(id, 'Resultado de la consulta - datos completos de la cuenta');
  }

  remove(id: number): Promise<AxiosResponse<DeletedPost>> {
    return this.delete<DeletedPost>(`/${id}`, {
      description: 'Eliminar la cuenta del banco',
    });
  }
}
