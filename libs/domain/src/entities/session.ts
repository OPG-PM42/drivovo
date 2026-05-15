import { z } from 'zod';

export interface SessionEntity {
  token: string;
  data: unknown;
  expiresAt: Date;
  createdAt: Date;
}

export const sessionSchema = z.object({
  token: z.string().min(1),
  data: z.unknown(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
});
