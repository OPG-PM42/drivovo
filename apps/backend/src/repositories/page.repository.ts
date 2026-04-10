import type { CarPageEntity } from "@drivovo/domain";
import type { OrderByModifiers } from "kysely";
import db from "../infrastructure/database";
import {
  createCarPageTable,
  createCarPageUpdates,
  createCarPageEntity,
} from "../infrastructure/database/tables";
import { type Repository, type SearchParams, RepositoryError } from "./repository";

const SORT_FIELD_MAP = {
  title: 'page_title',
  rating: 'rating',
} as const;

type PageSearchParams = SearchParams<'title' | 'rating'>;
export interface PageRepository extends Repository<CarPageEntity, PageSearchParams> {}

export default {
  async find(params: PageSearchParams = {}): Promise<CarPageEntity[]> {
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
      throw RepositoryError.from(error);
    }
  },

  async findOne(id: string): Promise<CarPageEntity | null> {
    try {
      const row = await db
        .selectFrom('car_page_entity')
        .selectAll()
        .where('page_id', '=', id)
        .executeTakeFirst();

      return row ? createCarPageEntity(row) : null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async insert(entity: CarPageEntity): Promise<string | null> {
    try {
      const result = await db
        .insertInto('car_pages')
        .values(createCarPageTable(entity))
        .returning('id')
        .executeTakeFirst();

      return result?.id ?? null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async update(entity: Partial<CarPageEntity> & { id: string }): Promise<string | null> {
    try {
      const pageUpdates = createCarPageUpdates(entity);

      if (Object.keys(pageUpdates).length === 0) return entity.id;

      const result = await db
        .updateTable('car_pages')
        .set(pageUpdates)
        .where('id', '=', entity.id)
        .returning('id')
        .executeTakeFirst();

      return result?.id ?? null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async delete(id: string): Promise<string | null> {
    try {
      const result = await db
        .deleteFrom('car_pages')
        .where('id', '=', id)
        .returning('id')
        .executeTakeFirst();

      return result?.id ?? null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },
} satisfies PageRepository;
