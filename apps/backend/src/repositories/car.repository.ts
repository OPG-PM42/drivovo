import type { CarEntity } from "@drivovo/domain";
import db from "../infrastructure/database";
import {
  createCarTable,
  createCarUpdates,
  createCarQuery,
  createCarEntity,
} from "../infrastructure/database/tables";
import type { Repository, SearchParams } from "./repository";
import { RepositoryError } from "../infrastructure/database/errors";

interface CarRepository extends Repository<CarEntity> {}

export default {
  async find(params: SearchParams): Promise<CarEntity[]> {
    try {
      const rows = await createCarQuery(params).execute();
      return rows.map((row) => createCarEntity(row));
    } catch (error) {
      throw RepositoryError.create(error);
    }
  },

  async findOne(id: string): Promise<CarEntity> {
    try {
      const row = await createCarQuery()
        .where("cars.id", "=", id)
        .executeTakeFirstOrThrow(
          () => new Error(`Car with id ${id} not found`)
        );

      return createCarEntity(row);
    } catch (error) {
      throw RepositoryError.create(error);
    }
  },

  async insert(entity: CarEntity): Promise<string> {
    try {
      const result = await db
        .insertInto("cars")
        .values(createCarTable(entity))
        .returning("id")
        .executeTakeFirstOrThrow();

      return result.id;
    } catch (error) {
      throw RepositoryError.create(error);
    }
  },

  async update(entity: Partial<CarEntity> & { id: string }): Promise<void> {
    try {
      const carUpdates = createCarUpdates(entity);

      if (Object.keys(carUpdates).length > 0) {
        await db
          .updateTable("cars")
          .set(carUpdates)
          .where("id", "=", entity.id)
          .execute();
      }
    } catch (error) {
      throw RepositoryError.create(error);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await db.deleteFrom("cars").where("id", "=", id).execute();
    } catch (error) {
      throw RepositoryError.create(error);
    }
  },
} satisfies CarRepository;
