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

const fuelTypeEnum = z.enum(['petrol', 'diesel', 'electric', 'hybrid', 'other']);
const carTypeEnum = z.enum(['sedan', 'hatchback', 'suv', 'mpv', 'coupe', 'convertible', 'van', 'pickup', 'bus', 'other']);
const oneOrMany = <T extends z.ZodTypeAny>(schema: T): z.ZodUnion<[T, z.ZodArray<T>]> =>
  z.union([schema, z.array(schema)]);

const carFiltersSchema = z.object({
  brand: oneOrMany(z.string().min(1)).optional(),
  type: oneOrMany(carTypeEnum).optional(),
  fuelType: oneOrMany(fuelTypeEnum).optional(),
}).passthrough();

type CarFilters = z.infer<typeof carFiltersSchema>;

function parseFilters(query: unknown): CarFilters {
  const result = carFiltersSchema.safeParse(query ?? {});
  if (!result.success) {
    throw new DomainError(
      DOMAIN_ERRORS.VALIDATION_ERROR,
      result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
    );
  }
  return result.data;
}

export default ({ repositories: repos }: Dependencies): CarService => ({
  getAll: (query?: unknown) => repos.cars.find(parseFilters(query)),
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
