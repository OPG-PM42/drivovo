import { z } from 'zod';

export const moneySchema = z.object({
  value: z.number().nonnegative(),
  currency: z.string().min(1),
});

export type Money = z.infer<typeof moneySchema>;
