import { type CarEntity } from '@drivovo/domain';
import { z } from 'zod';
import { type BaseService, type Dependencies, DOMAIN_ERRORS, DomainError } from './service';

type CarService = BaseService<CarEntity>;

function validateId(id: string) {
  const result = z.string().uuid().safeParse(id);
  if (!result.success) {
    throw new DomainError(DOMAIN_ERRORS.VALIDATION_ERROR, `Invalid id: ${id}`);
  }
}

export default ({ repositories: repos }: Dependencies): CarService => ({
  getAll: () => repos.cars.find(),
  getById: async (id: string) => {
    validateId(id);
    const car = await repos.cars.findOne(id);
    if (!car)
      throw new DomainError(DOMAIN_ERRORS.NOT_FOUND, `Car with id ${id} not found`);
    return car;
  },
  create: async (entity: CarEntity) => {
    return '00000000-0000-0000-0000-000000000001';
  },
  update: async (entity: CarEntity) => {
    return entity.id;
  },
  delete: async (id: string) => {
    return id;
  },
});
