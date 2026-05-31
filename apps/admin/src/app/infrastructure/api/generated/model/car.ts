// equivalent of typescript-angular generator output — hand-authored fallback
import { Image } from './image';
import { Engine } from './engine';

export interface Car {
  id: string;
  name: string;
  brand: string;
  description: string;
  driveType: Car.DriveTypeEnum;
  type: Car.TypeEnum;
  status: Car.StatusEnum;
  images: Array<Image>;
  engine: Engine;
  interiorTrim: string;
  acceleration: string;
  power: string;
  color: string;
  url: string;
}

export namespace Car {
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
}
