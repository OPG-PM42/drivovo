import type { Repositories } from '../../repositories';
import { SearchParams } from '../../repositories/repository';

export interface Dependencies {
  repositories: Repositories;
}

export type BaseService<T, P extends SearchParams = SearchParams, E extends object = {}> = {
  getAll: (perams: P) => Promise<T[]>;
  getById: (id: string) => Promise<T>;
  create: (entity: T) => Promise<string>;
  update: (entity: T) => Promise<string>;
  delete: (id: string) => Promise<string>;
} & E;

export type ServiceFactory<T, P extends SearchParams = SearchParams, E extends object = {}> = (dependencies: Dependencies) => BaseService<T, P, E>;

export const DOMAIN_ERRORS = {
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export class DomainError extends Error {
  readonly name: string = 'DomainError';

  static create(code: string, message: string, options?: { cause?: Error }) {
    return new DomainError(code, message, options);
  }

  constructor(public code: string, message: string, options?: { cause?: Error }) {
    super(message, options);
  }
}