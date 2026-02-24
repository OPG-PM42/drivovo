import type { Price } from "../value-object/price";
import type { Image } from "../value-object/image";

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