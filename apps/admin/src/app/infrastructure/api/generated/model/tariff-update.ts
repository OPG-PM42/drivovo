// equivalent of typescript-angular generator output — hand-authored fallback
import { Option } from './option';

export interface TariffUpdate {
  name?: string;
  type?: TariffUpdate.TypeEnum;
  options?: Array<Option>;
}

export namespace TariffUpdate {
  export type TypeEnum = 'leasing' | 'subscription';
  export const TypeEnum = {
    Leasing: 'leasing' as TypeEnum,
    Subscription: 'subscription' as TypeEnum,
  };
}
