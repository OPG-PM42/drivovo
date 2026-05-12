import { z } from 'zod';
import type { Price } from '../value-object/price';
import { imageSchema } from '../value-object/image';

type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'other';
type Status = 'available' | 'order';
type CarType = 'sedan' | 'hatchback' | 'suv' | 'mpv' | 'coupe' | 'convertible' | 'van' | 'pickup' | 'bus' | 'other';
type DriveType = 'FWD' | 'RWD' | 'AWD';

interface Engine {
  type: FuelType;
  capacity: string;
  fuel_consumption: string;
}

export interface CarEntity {
  id: string;
  name: string;
  brand: string;
  images: z.infer<typeof imageSchema>[];
  description: string;
  driveType: DriveType;
  type: CarType;
  url: string;
  acceleration: string;
  power: string;
  engine: Engine;
  interiorTrim: string;
  status: Status;
  color: string;
  price?: Price;
}

export const carBaseSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  description: z.string(),
  driveType: z.enum(['FWD', 'RWD', 'AWD']),
  type: z.enum(['sedan', 'hatchback', 'suv', 'mpv', 'coupe', 'convertible', 'van', 'pickup', 'bus', 'other']),
  status: z.enum(['available', 'order']),
  engineType: z.enum(['petrol', 'diesel', 'electric', 'hybrid', 'other']),
  engineCapacity: z.string().nullable(),
  engineFuelCons: z.string().nullable(),
  color: z.string().nullable(),
  interiorTrim: z.string().nullable(),
  power: z.string().nullable(),
  acceleration: z.string().nullable(),
  url: z.string().nullable(),
  images: z.array(imageSchema),
});

export const carCreateSchema = carBaseSchema;
export const carUpdateSchema = carBaseSchema.partial();

export type CarBase = z.infer<typeof carBaseSchema>;
export type CarCreate = z.infer<typeof carCreateSchema>;
export type CarUpdate = z.infer<typeof carUpdateSchema>;
