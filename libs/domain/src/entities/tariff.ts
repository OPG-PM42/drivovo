import type { Option } from "../value-object/option";

export interface TariffEntity {
    id: string;
    type: 'leasing' | 'subscription';
    name: string;
    options: Option[];
}
