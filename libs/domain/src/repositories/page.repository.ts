import type { CarPageEntity } from '../entities';
import type { CRUD } from './crud';

export interface PageRepository extends CRUD<CarPageEntity> {
  // Additional query methods
}
