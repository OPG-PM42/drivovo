import { type UserEntity, userSchema } from '@drivovo/domain';
import { z } from 'zod';
import type { UserSearchParams } from '../../repositories/user.repository';
import { type Dependencies, DOMAIN_ERRORS, DomainError } from './service';

export type CreateUserInput = Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserInput = Partial<Omit<UserEntity, 'createdAt' | 'updatedAt'>> & { id: string };

export const USER_ERRORS = {
  EMAIL_TAKEN: 'EMAIL_TAKEN',
  PHONE_TAKEN: 'PHONE_TAKEN',
} as const;

export interface UserService {
  getAll(params?: UserSearchParams): Promise<UserEntity[]>;
  getById(id: string): Promise<UserEntity>;
  getByEmail(email: string): Promise<UserEntity | null>;
  getByPhone(phone: string): Promise<UserEntity | null>;
  create(input: CreateUserInput): Promise<string>;
  update(input: UpdateUserInput): Promise<string>;
  delete(id: string): Promise<string>;
}

function formatIssues(error: z.ZodError): string {
  return error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
}

function validateId(id: string): void {
  const result = userSchema.shape.id.safeParse(id);
  if (!result.success) {
    throw new DomainError(DOMAIN_ERRORS.VALIDATION_ERROR, `Invalid id: ${id}`);
  }
}

function validateCreate(input: CreateUserInput): void {
  const schema = userSchema.omit({ id: true, createdAt: true, updatedAt: true });
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new DomainError(DOMAIN_ERRORS.VALIDATION_ERROR, formatIssues(result.error));
  }
}

function validateUpdate(input: UpdateUserInput): void {
  const schema = userSchema
    .partial()
    .omit({ createdAt: true, updatedAt: true })
    .extend({ id: userSchema.shape.id });
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new DomainError(DOMAIN_ERRORS.VALIDATION_ERROR, formatIssues(result.error));
  }
}

export default ({ repositories: repos }: Dependencies): UserService => {
  async function ensureEmailFree(email: string, excludeId?: string): Promise<void> {
    const existing = await repos.users.findByEmail(email);
    if (existing && existing.id !== excludeId) {
      throw new DomainError(USER_ERRORS.EMAIL_TAKEN, `User with email ${email} already exists`);
    }
  }

  async function ensurePhoneFree(phone: string, excludeId?: string): Promise<void> {
    const existing = await repos.users.findByPhone(phone);
    if (existing && existing.id !== excludeId) {
      throw new DomainError(USER_ERRORS.PHONE_TAKEN, `User with phone ${phone} already exists`);
    }
  }

  return {
    getAll: (params?: UserSearchParams) => repos.users.find(params),

    async getById(id) {
      validateId(id);
      const user = await repos.users.findOne(id);
      if (!user) {
        throw new DomainError(DOMAIN_ERRORS.NOT_FOUND, `User with id ${id} not found`);
      }
      return user;
    },

    getByEmail: (email) => repos.users.findByEmail(email),
    getByPhone: (phone) => repos.users.findByPhone(phone),

    async create(input) {
      validateCreate(input);
      await ensureEmailFree(input.email);
      await ensurePhoneFree(input.phone);
      const id = await repos.users.insert(input as UserEntity);
      if (!id) {
        throw new DomainError(DOMAIN_ERRORS.UNKNOWN_ERROR, 'Failed to create user');
      }
      return id;
    },

    async update(input) {
      validateUpdate(input);
      if (input.email !== undefined) await ensureEmailFree(input.email, input.id);
      if (input.phone !== undefined) await ensurePhoneFree(input.phone, input.id);
      const id = await repos.users.update(input);
      if (!id) {
        throw new DomainError(DOMAIN_ERRORS.NOT_FOUND, `User with id ${input.id} not found`);
      }
      return id;
    },

    async delete(id) {
      validateId(id);
      const deletedId = await repos.users.delete(id);
      if (!deletedId) {
        throw new DomainError(DOMAIN_ERRORS.NOT_FOUND, `User with id ${id} not found`);
      }
      return deletedId;
    },
  };
};
