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
 * registro con estos dos campos agregados. Es la única confirmación de
 * "eliminado" que esta API pública puede dar.
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

  remove(id: number): Promise<AxiosResponse<DeletedPost>> {
    return this.delete<DeletedPost>(`/${id}`, {
      description: 'Eliminar la cuenta del banco',
    });
  }
}
