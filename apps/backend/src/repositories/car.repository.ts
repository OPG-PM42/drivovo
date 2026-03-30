import type { CarEntity } from "../../../../libs/domain/src/entities";
import type {
  CarRepository,
  CarSearchParams,
} from "../../../../libs/domain/src/repositories";
import { Query } from "../../../../libs/query-builder";

export const createCarRepository = (): CarRepository => ({
  async find(params: CarSearchParams): Promise<CarEntity[]> {
    return await Query.create<CarEntity>("cars").where(params);
  },

  async findOne(id: string): Promise<CarEntity> {
    const rows = await Query.create<CarEntity>("cars").where({ id });
    const car = rows[0];
    if (!car) {
      throw new Error(`Car not found: ${id}`);
    }
    return car;
  },

  async findByUrl(url: string): Promise<CarEntity> {
    const rows = await Query.create<CarEntity>("cars").where({ url });
    const car = rows[0];
    if (!car) {
      throw new Error(`Car not found by url: ${url}`);
    }
    return car;
  },

  async insert(entity: CarEntity): Promise<string> {
    throw new Error("Not implemented");
  },

  async update(id: string, data: Partial<CarEntity>): Promise<void> {
    throw new Error("Not implemented");
  },

  async delete(id: string): Promise<void> {
    throw new Error("Not implemented");
  },
});
