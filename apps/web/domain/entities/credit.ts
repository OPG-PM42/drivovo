import type { CarEntity } from "./car";
import type { UserEntity } from "./user";

export interface CreditEntity {
    id: string;
    user: UserEntity;
    car: CarEntity;
    type: 'leasing' | 'subscribe';
}
