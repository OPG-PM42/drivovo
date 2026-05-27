import { z } from 'zod';
import type { Image } from '../value-object/image';
import type { Price } from '../value-object/price';

const fuelTypeSchema = z.enum(['petrol', 'diesel', 'electric', 'hybrid', 'other']);
const carTypeSchema = z.enum([
    'sedan', 'hatchback', 'suv', 'mpv', 'coupe', 'convertible', 'van', 'pickup', 'bus', 'other',
]);
const driveTypeSchema = z.enum(['FWD', 'RWD', 'AWD']);
const statusSchema = z.enum(['available', 'order']);

const imageSchema = z.object({
    url: z.string().url(),
    alt: z.string(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
});

const engineSchema = z.object({
    type: fuelTypeSchema,
    capacity: z.string(),
    fuel_consumption: z.string(),
});

export const carSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    brand: z.string().min(1),
    images: z.array(imageSchema),
    description: z.string(),
    driveType: driveTypeSchema,
    type: carTypeSchema,
    url: z.string(),
    acceleration: z.string(),
    power: z.string(),
    engine: engineSchema,
    interiorTrim: z.string(),
    status: statusSchema,
    color: z.string(),
});

export type FuelType = z.infer<typeof fuelTypeSchema>;
export type CarType = z.infer<typeof carTypeSchema>;
export type DriveType = z.infer<typeof driveTypeSchema>;
export type Status = z.infer<typeof statusSchema>;

export interface CarEntity {
    id: string;
    name: string;
    brand: string;
    images: Image[];
    description: string;
    driveType: DriveType;
    type: CarType;
    url: string;
    acceleration: string;
    power: string;
    engine: {
        type: FuelType;
        capacity: string;
        fuel_consumption: string;
    };
    interiorTrim: string;
    status: Status;
    color: string;
    price: Price;
}
