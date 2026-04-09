export interface SearchParams<T extends string = string> {
  limit?: number;
  offset?: number;
  sortField?: T;
  sortOrder?: 'asc' | 'desc';
}

export interface Repository<E, P extends SearchParams = SearchParams> {
  find(params: P): Promise<E[]>;
  findOne(id: string): Promise<E>;
  insert(entity: E): Promise<string>;
  update(entity: Partial<E> & { id: string }): Promise<void>;
  delete(id: string): Promise<void>;
}
