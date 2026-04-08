import type { CarPageEntity } from "@drivovo/domain";
import type { OrderByModifiers } from "kysely";
import db from "../infrastructure/database";
import {
  createCarPageTable,
  createCarPageUpdates,
  createCarPageEntity,
} from "../infrastructure/database/tables";
import type { Repository, SearchParams } from "./repository";
import { DATABASE_ERRORS, RepositoryError } from "../infrastructure/database/errors";

const SORT_FIELD_MAP = {
  title: 'page_title',
  rating: 'rating',
} as const;

interface PageRepository extends Repository<CarPageEntity> {}

export default {
  async find(params: SearchParams<'title' | 'rating'>): Promise<CarPageEntity[]> {
    try {
      const rows = await db
        .selectFrom('car_page_entity')
        .selectAll()
        .$if(Boolean(params?.sortField && SORT_FIELD_MAP[params.sortField]), (query) =>
          query.orderBy(SORT_FIELD_MAP[params.sortField!], params.sortOrder),
        )
        .$if(Boolean(params?.limit), (query) => query.limit(params.limit!))
        .$if(Boolean(params?.offset), (query) => query.offset(params.offset!))
        .execute();

      return rows.map(createCarPageEntity);
    } catch (error) {
      throw RepositoryError.create(error);
    }
  },

  async findOne(id: string): Promise<CarPageEntity> {
    try {
      const row = await db
        .selectFrom('car_page_entity')
        .selectAll()
        .where('page_id', '=', id)
        .executeTakeFirstOrThrow(() => 
          new RepositoryError(
            DATABASE_ERRORS.NOT_FOUND_ERROR,
            `CarPage with id ${id} not found`
          )
        );

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
