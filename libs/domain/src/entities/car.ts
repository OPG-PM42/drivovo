import { z } from 'zod';
import type { Price } from "../value-object/price";
import type { Image } from "../value-object/image";

export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'other';
export type Status = 'available' | 'order';
export type CarType = 'sedan' | 'hatchback' | 'suv' | 'mpv' | 'coupe' | 'convertible' | 'van' | 'pickup' | 'bus' | 'other';
export type DriveType = 'FWD' | 'RWD' | 'AWD';

export interface Engine {
    type: FuelType;
    capacity: string;
    fuel_consumption: string;
}

export interface CarEntity {
    id: string;
    name: string
    brand: string
    images: Image[];
    description: string;
    driveType: DriveType;
    type: CarType;
    url: string;
    acceleration: string;
    power: string;
    engine: Engine;
    interiorTrim: string; // обивка салона
    status: Status;
    color: string;
    price: Price;
}

const imageSchema = z.object({
    url: z.string().url(),
    alt: z.string(),
    width: z.number().positive(),
    height: z.number().positive(),
});

const engineSchema = z.object({
    type: z.enum(['petrol', 'diesel', 'electric', 'hybrid', 'other']),
    capacity: z.string().min(1),
    fuel_consumption: z.string().min(1),
});

const priceSchema = z.object({
    value: z.number().min(0),
    currency: z.string().min(1),
    countryId: z.string().min(1),
    carId: z.string().uuid(),
});

export const carSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    brand: z.string().min(1),
    images: z.array(imageSchema),
    description: z.string(),
    driveType: z.enum(['FWD', 'RWD', 'AWD']),
    type: z.enum(['sedan', 'hatchback', 'suv', 'mpv', 'coupe', 'convertible', 'van', 'pickup', 'bus', 'other']),
    url: z.string().min(1),
    acceleration: z.string().min(1),
    power: z.string().min(1),
    engine: engineSchema,
    interiorTrim: z.string(),
    status: z.enum(['available', 'order']),
    color: z.string().min(1),
    price: priceSchema.optional(),
});