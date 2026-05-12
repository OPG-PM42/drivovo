import { z } from 'zod';

export const imageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().nullable(),
  width: z.number().int().nonnegative(),
  height: z.number().int().nonnegative(),
});

export type Image = z.infer<typeof imageSchema>;
