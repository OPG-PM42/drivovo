import type { CarEntity } from '../entities';
import type { CRUD, SearchParams } from './crud';

export interface CarSearchParams extends SearchParams {
  brand?: string;
  type?: string;
  status?: string;
  driveType?: string;
  color?: string;
}

export interface CarRepository extends CRUD<CarEntity, CarSearchParams> {}
