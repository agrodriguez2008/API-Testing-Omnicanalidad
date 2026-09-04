import type { AxiosResponse } from 'axios';
import { BaseService } from './base.service';

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export type NewPost = Omit<Post, 'id'>;

/** Cliente de ejemplo para /posts en jsonplaceholder.typicode.com. */
export class PostsService extends BaseService {
  constructor() {
    super({ basePath: '/posts' });
  }

  getById(id: number): Promise<AxiosResponse<Post>> {
    return this.get<Post>(`/${id}`);
  }

  create(post: NewPost): Promise<AxiosResponse<Post>> {
    return this.post<Post>('', post);
  }
}
