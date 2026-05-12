import { z } from 'zod';
import { moneySchema } from './money';

export const optionSchema = z.object({
  name: z.string().min(1),
  price: moneySchema,
  carId: z.string().uuid().optional(),
  countryId: z.string().uuid().optional(),
});

export type Option = z.infer<typeof optionSchema>;
