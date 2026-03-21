import type { CarPageEntity } from '../entities';
import type { CRUD, SearchParams } from './crud';

export interface PageSearchParams extends SearchParams {
  carId?: string;
  minRating?: number;
}

export interface PageRepository extends CRUD<CarPageEntity, PageSearchParams> {
  findByCarId(carId: string): Promise<CarPageEntity>;
}
