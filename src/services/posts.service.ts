import type { AxiosResponse } from 'axios';
import { BaseService } from './base.service';

export interface Post {
  id: number;
  title: string;
  userId: number;
}

export type NewPost = Omit<Post, 'id'>;

/** Cliente de ejemplo para /posts en dummyjson.com. */
export class PostsService extends BaseService {
  constructor() {
    super({ basePath: '/posts' });
  }

  create(post: NewPost): Promise<AxiosResponse<Post>> {
    return this.post<Post>('/add', post, {
      description: `Registrar una solicitud para el cliente #${post.userId}`,
    });
  }
}
