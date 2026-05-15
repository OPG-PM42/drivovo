import type { AdminEntity } from '@drivovo/domain';
import { DATABASE_ERRORS } from '../../repositories/repository';
import { type Dependencies, DOMAIN_ERRORS, DomainError } from './service';

export type CreateAdminInput = Omit<AdminEntity, 'id' | 'createdAt' | 'updatedAt'>;

export interface AdminService {
  create(input: CreateAdminInput): Promise<string>;
  getById(id: string): Promise<AdminEntity>;
  getByEmail(email: string): Promise<AdminEntity | null>;
}

export default ({ repositories: repos }: Dependencies): AdminService => ({
  async create(input) {
    try {
      const id = await repos.admins.insert(input as AdminEntity);
      if (!id) throw new DomainError(DOMAIN_ERRORS.UNKNOWN_ERROR, 'Failed to create admin');
      return id;
    } catch (err) {
      if (err instanceof Error && (err as { code?: string }).code === DATABASE_ERRORS.DUPLICATE_ERROR) {
        throw new DomainError('EMAIL_TAKEN', `Admin with email ${input.email} already exists`);
      }
      throw err;
    }
  },

  async getById(id) {
    const admin = await repos.admins.findOne(id);
    if (!admin) throw new DomainError(DOMAIN_ERRORS.NOT_FOUND, `Admin with id ${id} not found`);
    return admin;
  },

  async getByEmail(email) {
    return repos.admins.findByEmail(email);
  },
});
