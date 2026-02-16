import type { Image } from "../value-objects/image";

type CarType = 'sedan' | 'hatchback' | 'suv' | 'mpv' | 'coupe' | 'convertible' | 'van' | 'pickup' | 'bus' | 'other';
type DriveType = 'FWD' | 'RWD' | 'AWD';
type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'other';
type Status = 'available' | 'order';

interface Engine {
    type: FuelType;
    capacity: string;
    fuel_consumption: string;
}

export interface CarPrice {
    price: number;
    currency: string;
}


export interface CarEntity {
    id: string;
    name: string
    brand: string
    images: Image[];
    description: string;
    acceleration: string;
    power: string;
    engine: Engine;
    interiorTrim: string; // обивка салона
    driveType: DriveType;
    type: CarType;
    url: string;
    status: Status;
    color: string;
    prices: { // ???
        ua: CarPrice;
        pl: CarPrice;
    }
}