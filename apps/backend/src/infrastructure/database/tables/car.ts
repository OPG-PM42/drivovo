import type { ColumnType, Generated, JSONColumnType, Selectable, Insertable, Updateable } from 'kysely';
import type { CarEntity, Price } from '@drivovo/domain';
import { createImage, createImageJson } from './image';
import type { ImageJson } from './image';

export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'other';
export type CarStatus = 'available' | 'order';
export type CarType = 'sedan' | 'hatchback' | 'suv' | 'mpv' | 'coupe' | 'convertible' | 'van' | 'pickup' | 'bus' | 'other';
export type DriveType = 'FWD' | 'RWD' | 'AWD';

export interface CarsTable {
  id: Generated<string>;
  name: string;
  brand: string;
  description: string | null;
  drive_type: DriveType;
  type: CarType;
  url: string | null;
  acceleration: string | null;
  power: string | null;
  color: string | null;
  interior_trim: string | null;
  status: ColumnType<CarStatus, CarStatus | undefined, CarStatus | undefined>;
  engine_type: FuelType;
  engine_capacity: string | null;
  engine_fuel_cons: string | null;
  images: JSONColumnType<ImageJson[]>;
}

export function createCarEntity(row: Selectable<CarsTable>, price?: Price): CarEntity {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    images: (row.images ?? []).map(createImage),
    description: row.description ?? '',
    driveType: row.drive_type,
    type: row.type,
    url: row.url ?? '',
    acceleration: row.acceleration ?? '',
    power: row.power ?? '',
    engine: {
      type: row.engine_type,
      capacity: row.engine_capacity ?? '',
      fuel_consumption: row.engine_fuel_cons ?? '',
    },
    interiorTrim: row.interior_trim ?? '',
    status: row.status,
    color: row.color ?? '',
    price: price ?? { value: 0, currency: '', countryId: '', carId: row.id },
  };
}

export function createCarTable(entity: CarEntity): Insertable<CarsTable> {
  return {
    id: entity.id,
    name: entity.name,
    brand: entity.brand,
    description: entity.description || null,
    drive_type: entity.driveType,
    type: entity.type,
    url: entity.url || null,
    acceleration: entity.acceleration || null,
    power: entity.power || null,
    color: entity.color || null,
    interior_trim: entity.interiorTrim || null,
    status: entity.status,
    engine_type: entity.engine.type,
    engine_capacity: entity.engine.capacity || null,
    engine_fuel_cons: entity.engine.fuel_consumption || null,
    images: JSON.stringify(entity.images.map(createImageJson)),
  };
}

export function createCarUpdates(entity: Partial<CarEntity>): Updateable<CarsTable> {
  const props = {
    name: entity.name,
    brand: entity.brand,
    description: entity.description,
    drive_type: entity.driveType,
    type: entity.type,
    url: entity.url,
    acceleration: entity.acceleration,
    power: entity.power,
    color: entity.color,
    interior_trim: entity.interiorTrim,
    status: entity.status,
    engine_type: entity.engine?.type,
    engine_capacity: entity.engine?.capacity,
    engine_fuel_cons: entity.engine?.fuel_consumption,
    images: entity.images ? JSON.stringify(entity.images.map(createImageJson)) : undefined,
  };
  const result: Record<string, string | number | null> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) result[key] = value;
  }
  return result;
}
