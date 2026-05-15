import { type CarEntity, carSchema } from '@drivovo/domain';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { type BaseService, type Dependencies, DOMAIN_ERRORS, DomainError } from './service';

type CarService = BaseService<CarEntity>;

function validateId(id: string) {
  const result = z.string().uuid().safeParse(id);
  if (!result.success) {
    throw new DomainError(DOMAIN_ERRORS.VALIDATION_ERROR, `Invalid id: ${id}`);
  }
}

function validate(entity: CarEntity, { partial = false }: { partial?: boolean } = {}) {
  const schema = partial
    ? carSchema.partial()
    : carSchema.omit({ id: true });
  const result = schema.safeParse(entity);
  if (!result.success) {
    throw new DomainError(
      DOMAIN_ERRORS.VALIDATION_ERROR,
      result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
    );
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
    validate(entity);
    const generatedId = randomUUID();
    const entityWithId = {
      ...entity,
      id: generatedId,
      price: entity.price || { value: 0, currency: '', countryId: '', carId: generatedId },
    };
    const id = await repos.cars.insert(entityWithId);
    if (!id)
      throw new DomainError(DOMAIN_ERRORS.UNKNOWN_ERROR, `Failed to create car`);
    return id;
  },
  update: async (entity: CarEntity) => {
    return entity.id;
  },
  delete: async (id: string) => {
    return id;
  },
});
