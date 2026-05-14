import { generateToken, verifyPassword } from '@drivovo/utils';
import { DomainError } from '../domain/services/service';

const INVALID_CREDENTIALS = 'INVALID_CREDENTIALS';

const errors = {
  [INVALID_CREDENTIALS]: { code: 401, message: 'Invalid email or password' },
};

export const createAuthEndpoint = (domain) => [
  {
    path: '/sign-in',
    method: 'POST',
    access: 'public',
    errors,
    handler: async (ctx) => {
      const { email, password } = ctx.body ?? {};
      const admin = email ? await domain.admins.getByEmail(email) : null;
      const ok = admin && password
        ? verifyPassword(password, admin.passwordHash, admin.passwordSalt)
        : false;
      if (!ok || !admin) {
        throw new DomainError(INVALID_CREDENTIALS, 'Invalid email or password');
      }
      const token = generateToken();
      await ctx.auth.startSession(token, { adminId: admin.id });
      const { passwordHash, passwordSalt, ...adminData } = admin;
      return adminData;
    },
  },
  {
    path: '/sign-out',
    method: 'POST',
    access: 'private',
    handler: async (ctx) => {
      await ctx.auth.endSession();
    },
  },
  {
    path: '/me',
    method: 'GET',
    access: 'private',
    handler: async (ctx) => {
      const { adminId } = ctx.auth.session.data ?? {};
      const { passwordHash, passwordSalt, ...admin } = await domain.admins.getById(adminId);
      return admin;
    },
  },
];
