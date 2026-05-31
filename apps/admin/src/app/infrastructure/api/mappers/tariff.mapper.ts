import {
  Tariff as GeneratedTariff,
  TariffCreate as GeneratedTariffCreate,
  TariffUpdate as GeneratedTariffUpdate,
} from '../generated';
import { TariffEntity, TariffCreate, TariffUpdate } from '../../../domain/tariff';

export function toTariffEntity(dto: GeneratedTariff): TariffEntity {
  return { ...dto };
}

export function toGeneratedTariffCreate(data: TariffCreate): GeneratedTariffCreate {
  return data as unknown as GeneratedTariffCreate;
}

export function toGeneratedTariffUpdate(data: TariffUpdate): GeneratedTariffUpdate {
  return data as unknown as GeneratedTariffUpdate;
}
