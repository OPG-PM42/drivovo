import type { CarEntity } from "@drivovo/domain";
import db from "../infrastructure/database";
import {
  createCarTable,
  createCarUpdates,
  createCarEntity,
} from "../infrastructure/database/tables";
import { type Repository, type SearchParams, RepositoryError } from "./repository";

const SORT_FIELD_MAP = {
  name: 'name',
  brand: 'brand',
  status: 'status',
} as const;

type CarSearchParams = SearchParams<'name' | 'brand' | 'status'>;
export interface CarRepository extends Repository<CarEntity, CarSearchParams> {
  count(params?: CarSearchParams): Promise<number>;
}

export default {
  async find(params: CarSearchParams): Promise<CarEntity[]> {
    try {
      const rows = await db
        .selectFrom('cars')
        .selectAll()
        .$if(Boolean(params?.sortField && SORT_FIELD_MAP[params.sortField!]), (query) =>
          query.orderBy(SORT_FIELD_MAP[params.sortField!], params.sortOrder),
        )
        .$if(Boolean(params?.limit), (query) => query.limit(params.limit!))
        .$if(Boolean(params?.offset), (query) => query.offset(params.offset!))
        .execute();

      return rows.map((row) => createCarEntity(row));
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async findOne(id: string): Promise<CarEntity | null> {
    try {
      const row = await db
        .selectFrom('cars')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();

      return row ? createCarEntity(row) : null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async insert(entity: CarEntity): Promise<string | null> {
    try {
      const result = await db
        .insertInto("cars")
        .values(createCarTable(entity))
        .returning("id")
        .executeTakeFirst();

      return result?.id ?? null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async update(entity: Partial<CarEntity> & { id: string }): Promise<string | null> {
    try {
      const carUpdates = createCarUpdates(entity);

      if (Object.keys(carUpdates).length === 0) return entity.id;

      const result = await db
        .updateTable("cars")
        .set(carUpdates)
        .where("id", "=", entity.id)
        .returning("id")
        .executeTakeFirst();

      return result?.id ?? null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async delete(id: string): Promise<string | null> {
    try {
      const result = await db
        .deleteFrom("cars")
        .where("id", "=", id)
        .returning("id")
        .executeTakeFirst();

      return result?.id ?? null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async count(_params?: CarSearchParams): Promise<number> {
    try {
      const result = await db
        .selectFrom('cars')
        .select((eb) => eb.fn.countAll().as('total'))
        .executeTakeFirst();
      return Number(result?.total ?? 0);
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },
} satisfies CarRepository;
