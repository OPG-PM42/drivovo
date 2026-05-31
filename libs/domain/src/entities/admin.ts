import { z } from 'zod';

export type AdminRole = 'admin' | 'manager';

export interface AdminEntity {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  passwordHash: string;
  passwordSalt: string;
  createdAt: Date;
  updatedAt: Date;
}

export const adminSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin', 'manager']),
  passwordHash: z.string().min(1),
  passwordSalt: z.string().min(1),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export interface AdminPublicView {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAt: Date;
  updatedAt: Date;
}

export const adminPublicViewSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin', 'manager']),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
