// equivalent of typescript-angular generator output — hand-authored fallback
import { Option } from './option';

export interface TariffCreate {
  name: string;
  type: TariffCreate.TypeEnum;
  options?: Array<Option>;
}

export namespace TariffCreate {
  export type TypeEnum = 'leasing' | 'subscription';
  export const TypeEnum = {
    Leasing: 'leasing' as TypeEnum,
    Subscription: 'subscription' as TypeEnum,
  };
}
