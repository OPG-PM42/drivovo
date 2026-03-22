import type { UserEntity } from '../entities';
import type { CRUD, SearchParams } from './crud';

/**
 * Domain-specific search filters for users.
 * Extends base SearchParams with fields relevant to UserEntity.
 */
export interface UserSearchParams extends SearchParams {
  drivingExperience?: UserEntity['drivingExperience'];
  cameFrom?: string;
  availabilityDay?: UserEntity['availability']['day'];
  availabilityTime?: UserEntity['availability']['time'];
}

/**
 * User repository port (domain layer).
 *
 * This is the single contract for user persistence.
 * Infrastructure adapters (e.g. PostgresUserRepository) implement it.
 * Application layer use cases depend on this interface — never on the
 * concrete adapter — so the domain stays decoupled from storage details.
 *
 * Returns null (not throws) when an entity is not found, because
 * "not found" is a normal query outcome, not an exceptional case.
 * Use cases decide whether to throw or handle null upstream.
 */
export interface UserRepository extends CRUD<UserEntity, UserSearchParams> {
  findByEmail(email: string): Promise<UserEntity | null>;
  findByPhone(phone: string): Promise<UserEntity | null>;
}
