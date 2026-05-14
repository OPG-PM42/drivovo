import { z } from 'zod';
import { optionSchema, type Option } from '../value-object/option';

export interface TariffEntity {
  id: string;
  type: 'leasing' | 'subscription';
  name: string;
  options: Option[];
}

export const tariffBaseSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['leasing', 'subscription']),
  options: z.array(optionSchema),
});

export const tariffCreateSchema = tariffBaseSchema;
export const tariffUpdateSchema = tariffBaseSchema.partial();

export type TariffBase = z.infer<typeof tariffBaseSchema>;
export type TariffCreate = z.infer<typeof tariffCreateSchema>;
export type TariffUpdate = z.infer<typeof tariffUpdateSchema>;
