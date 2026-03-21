import type { UserEntity } from '../entities';
import type { CRUD, SearchParams } from './crud';

export interface UserSearchParams extends SearchParams {
  drivingExperience?: UserEntity['drivingExperience'];
  cameFrom?: string;
  availabilityDay?: UserEntity['availability']['day'];
  availabilityTime?: UserEntity['availability']['time'];
  drinks?: UserEntity['drinks'];
}

export interface UserRepository extends CRUD<UserEntity, UserSearchParams> {
  findByEmail(email: string): Promise<UserEntity>;
  findByPhone(phone: string): Promise<UserEntity>;
}
