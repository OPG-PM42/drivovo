// equivalent of typescript-angular generator output — hand-authored fallback
import { Option } from './option';

export interface Tariff {
  id: string;
  name: string;
  type: Tariff.TypeEnum;
  options: Array<Option>;
}

export namespace Tariff {
  export type TypeEnum = 'leasing' | 'subscription';
  export const TypeEnum = {
    Leasing: 'leasing' as TypeEnum,
    Subscription: 'subscription' as TypeEnum,
  };
}
