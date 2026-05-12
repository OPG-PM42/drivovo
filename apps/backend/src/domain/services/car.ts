import type { CarEntity } from '@drivovo/domain';
import { type Dependencies, DOMAIN_ERRORS, DomainError } from './service';
import type { CarRepository } from '../../repositories/car.repository';

type CarSearchParams = Parameters<CarRepository['find']>[0];

export interface CarService {
  getAll(params?: CarSearchParams): Promise<CarEntity[]>;
  count(params?: CarSearchParams): Promise<number>;
  getById(id: string): Promise<CarEntity>;
  create(entity: CarEntity): Promise<string>;
  update(entity: Partial<CarEntity> & { id: string }): Promise<string>;
  delete(id: string): Promise<string>;
}

export default ({ repositories: repos }: Dependencies): CarService => ({
  async getAll(params) {
    return repos.cars.find(params ?? {});
  },
  async count(params) {
    return repos.cars.count(params);
  },
  async getById(id) {
    const car = await repos.cars.findOne(id);
    if (!car) throw new DomainError(DOMAIN_ERRORS.NOT_FOUND, `Car with id ${id} not found`);
    return car;
  },
  async create(entity) {
    const id = await repos.cars.insert(entity);
    if (!id) throw new DomainError(DOMAIN_ERRORS.UNKNOWN_ERROR, 'Failed to create car');
    return id;
  },
  async update(entity) {
    const id = await repos.cars.update(entity);
    if (!id) throw new DomainError(DOMAIN_ERRORS.NOT_FOUND, `Car with id ${entity.id} not found`);
    return id;
  },
  async delete(id) {
    const deleted = await repos.cars.delete(id);
    if (!deleted) throw new DomainError(DOMAIN_ERRORS.NOT_FOUND, `Car with id ${id} not found`);
    return deleted;
  },
});
