// equivalent of typescript-angular generator output — hand-authored fallback
export interface Engine {
  type: Engine.TypeEnum;
  capacity: string;
  fuel_consumption: string;
}

export namespace Engine {
  export type TypeEnum = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'other';
  export const TypeEnum = {
    Petrol: 'petrol' as TypeEnum,
    Diesel: 'diesel' as TypeEnum,
    Electric: 'electric' as TypeEnum,
    Hybrid: 'hybrid' as TypeEnum,
    Other: 'other' as TypeEnum,
  };
}
