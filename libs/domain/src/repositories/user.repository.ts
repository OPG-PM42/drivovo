import type { UserEntity } from '../entities';
import type { CRUD } from './crud';

export interface UserRepository extends CRUD<UserEntity> {
  // Additional query methods
}
