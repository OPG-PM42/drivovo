import type { CarPageEntity } from "@drivovo/domain";
import db from "../infrastructure/database";
import {
  createCarPageTable,
  createCarPageUpdates,
  createCarPageQuery,
  createCarPageEntity,
} from "../infrastructure/database/tables";
import type { Repository, SearchParams } from "./repository";
import { RepositoryError } from "../infrastructure/database/errors";

interface PageRepository extends Repository<CarPageEntity> {}

export default {
  async find(params: SearchParams): Promise<CarPageEntity[]> {
    try {
      const rows = await createCarPageQuery(params).execute();
      return rows.map(createCarPageEntity);
    } catch (error) {
      throw RepositoryError.create(error);
    }
  },

  async findOne(id: string): Promise<CarPageEntity> {
    try {
      const row = await createCarPageQuery()
        .where('car_pages.id', '=', id)
        .executeTakeFirstOrThrow(() => new Error(`CarPage with id ${id} not found`));

      return createCarPageEntity(row);
    } catch (error) {
      throw RepositoryError.create(error);
    }
  },

  async insert(entity: CarPageEntity): Promise<string> {
    try {
      const result = await db
        .insertInto('car_pages')
        .values(createCarPageTable(entity))
        .returning('id')
        .executeTakeFirstOrThrow();

      return result.id;
    } catch (error) {
      throw RepositoryError.create(error);
    }
  },

  async update(entity: Partial<CarPageEntity> & { id: string }): Promise<void> {
    try {
      const pageUpdates = createCarPageUpdates(entity);

      if (Object.keys(pageUpdates).length > 0) {
        await db
          .updateTable('car_pages')
          .set(pageUpdates)
          .where('id', '=', entity.id)
          .execute();
      }
    } catch (error) {
      throw RepositoryError.create(error);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await db
        .deleteFrom('car_pages')
        .where('id', '=', id)
        .execute();
    } catch (error) {
      throw RepositoryError.create(error);
    }
  },
} satisfies PageRepository;
