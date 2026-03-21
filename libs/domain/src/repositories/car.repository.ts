import type { CarEntity } from '../entities';
import type { CRUD, SearchParams } from './crud';

export interface CarSearchParams extends SearchParams {
  brand?: string;
  type?: CarEntity['type'];
  status?: CarEntity['status'];
}

export interface CarRepository extends CRUD<CarEntity, CarSearchParams> {
  findByUrl(url: string): Promise<CarEntity>;
}
