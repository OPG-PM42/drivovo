import {
  Car as GeneratedCar,
  CarCreate as GeneratedCarCreate,
  CarUpdate as GeneratedCarUpdate,
} from '../generated';
import { CarEntity, CarCreate, CarUpdate } from '../../../domain/car';

export function toCarEntity(dto: GeneratedCar): CarEntity {
  return { ...dto };
}

export function toGeneratedCarCreate(data: CarCreate): GeneratedCarCreate {
  return data as unknown as GeneratedCarCreate;
}

export function toGeneratedCarUpdate(data: CarUpdate): GeneratedCarUpdate {
  return data as unknown as GeneratedCarUpdate;
}
