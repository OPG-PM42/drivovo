export interface SearchParams {
  limit?: number;
  offset?: number;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CRUD<E, P extends SearchParams = SearchParams> {
  find(params: P): Promise<E[]>;
  findOne(id: string): Promise<E>;
  insert(entity: E): Promise<string>;
  update(id: Partial<E>): Promise<void>;
  delete(id: string): Promise<void>;
}
