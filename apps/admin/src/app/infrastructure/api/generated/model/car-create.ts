// equivalent of typescript-angular generator output — hand-authored fallback
import { Image } from './image';

export interface CarCreate {
  name: string;
  brand: string;
  description?: string;
  driveType: CarCreate.DriveTypeEnum;
  type: CarCreate.TypeEnum;
  status: CarCreate.StatusEnum;
  engineType: CarCreate.EngineTypeEnum;
  engineCapacity?: string | null;
  engineFuelCons?: string | null;
  color?: string | null;
  interiorTrim?: string | null;
  power?: string | null;
  acceleration?: string | null;
  url?: string | null;
  images?: Array<Image>;
}

export namespace CarCreate {
  export type DriveTypeEnum = 'FWD' | 'RWD' | 'AWD';
  export const DriveTypeEnum = {
    Fwd: 'FWD' as DriveTypeEnum,
    Rwd: 'RWD' as DriveTypeEnum,
    Awd: 'AWD' as DriveTypeEnum,
  };

  export type TypeEnum =
    | 'sedan'
    | 'hatchback'
    | 'suv'
    | 'mpv'
    | 'coupe'
    | 'convertible'
    | 'van'
    | 'pickup'
    | 'bus'
    | 'other';
  export const TypeEnum = {
    Sedan: 'sedan' as TypeEnum,
    Hatchback: 'hatchback' as TypeEnum,
    Suv: 'suv' as TypeEnum,
    Mpv: 'mpv' as TypeEnum,
    Coupe: 'coupe' as TypeEnum,
    Convertible: 'convertible' as TypeEnum,
    Van: 'van' as TypeEnum,
    Pickup: 'pickup' as TypeEnum,
    Bus: 'bus' as TypeEnum,
    Other: 'other' as TypeEnum,
  };

  export type StatusEnum = 'available' | 'order';
  export const StatusEnum = {
    Available: 'available' as StatusEnum,
    Order: 'order' as StatusEnum,
  };

  export type EngineTypeEnum = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'other';
  export const EngineTypeEnum = {
    Petrol: 'petrol' as EngineTypeEnum,
    Diesel: 'diesel' as EngineTypeEnum,
    Electric: 'electric' as EngineTypeEnum,
    Hybrid: 'hybrid' as EngineTypeEnum,
    Other: 'other' as EngineTypeEnum,
  };
}
