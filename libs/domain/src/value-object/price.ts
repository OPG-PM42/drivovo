import type { Money } from "./money";

export interface Price extends Money {
    countryId: string;
    carId: string;
}