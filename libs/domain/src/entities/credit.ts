import type { TariffEntity } from "./tariff";
import type { CarEntity } from "./car";
import type { CountryEntity } from "./country";
import type { UserEntity } from "./user";

import type { Money } from "../value-object/money";

export interface CreditEntity {
    id: string;
    tariff: TariffEntity;
    car: CarEntity;
    country: CountryEntity;
    user: UserEntity;
    status: 'pending' | 'approved' | 'rejected';
    term: number;
    deposit: Money;
    createdAt: Date;
    updatedAt: Date;
}