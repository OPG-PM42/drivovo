// equivalent of typescript-angular generator output — hand-authored fallback
import { Money } from './money';

export interface Option {
  name: string;
  price: Money;
  carId?: string;
  countryId?: string;
}
