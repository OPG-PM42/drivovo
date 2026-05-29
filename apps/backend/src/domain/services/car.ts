import { type CarEntity, carSchema } from "@drivovo/domain";
import { z } from "zod";
import type { CarSearchParams } from "../../repositories/car.repository";
import { type Dependencies, DOMAIN_ERRORS, DomainError } from "./service";

export type CreateCarInput = Omit<CarEntity, "id" | "price">;

export interface CarService {
  getAll(query?: unknown): Promise<CarEntity[]>;
  getById(id: string): Promise<CarEntity>;
  create(input: CreateCarInput): Promise<string>;
  update(entity: CarEntity): Promise<string>;
  delete(id: string): Promise<string>;
}

const fuelTypeEnum = z.enum([
  "petrol",
  "diesel",
  "electric",
  "hybrid",
  "other",
]);
const carTypeEnum = z.enum([
  "sedan",
  "hatchback",
  "suv",
  "mpv",
  "coupe",
  "convertible",
  "van",
  "pickup",
  "bus",
  "other",
]);

const carQuerySchema = z
  .object({
    brand: z.array(z.string().min(1)).optional(),
    type: z.array(carTypeEnum).optional(),
    fuelType: z.array(fuelTypeEnum).optional(),
  })
  .passthrough();

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((i) => `${i.path.join(".")}: ${i.message}`)
    .join("; ");
}

function validateId(id: string): void {
  const result = carSchema.shape.id.safeParse(id);
  if (!result.success) {
    throw new DomainError(DOMAIN_ERRORS.VALIDATION_ERROR, `Invalid id: ${id}`);
  }
}

function validateCreate(input: unknown): asserts input is CreateCarInput {
  const schema = carSchema.omit({ id: true });
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new DomainError(
      DOMAIN_ERRORS.VALIDATION_ERROR,
      formatIssues(result.error)
    );
  }
}

function validateQuery(query: unknown): asserts query is CarSearchParams {
  const result = carQuerySchema.safeParse(query ?? {});
  if (!result.success) {
    throw new DomainError(
      DOMAIN_ERRORS.VALIDATION_ERROR,
      formatIssues(result.error)
    );
  }
}

export default ({ repositories: repos }: Dependencies): CarService => ({
  getAll: (query?: unknown) => {
    validateQuery(query);
    return repos.cars.find(query);
  },

  async getById(id) {
    validateId(id);
    const car = await repos.cars.findOne(id);
    if (!car) {
      throw new DomainError(
        DOMAIN_ERRORS.NOT_FOUND,
        `Car with id ${id} not found`
      );
    }
    return car;
  },

  async create(input) {
    validateCreate(input);
    const id = await repos.cars.insert(input as CarEntity);
    if (!id) {
      throw new DomainError(
        DOMAIN_ERRORS.UNKNOWN_ERROR,
        "Failed to create car"
      );
    }
    return id;
  },

  // TODO: implement
  update: async (entity: CarEntity) => {
    return entity.id;
  },
  // TODO: implement
  delete: async (id: string) => {
    return id;
  },
});
