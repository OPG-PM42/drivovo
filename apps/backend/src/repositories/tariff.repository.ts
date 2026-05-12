import type { TariffEntity } from "@drivovo/domain";
import db from "../infrastructure/database";
import {
  createTariffTable,
  createTariffUpdates,
  createTariffEntity,
} from "../infrastructure/database/tables/tariff";
import { type Repository, type SearchParams, RepositoryError } from "./repository";

const SORT_FIELD_MAP = {
  name: 'name',
  type: 'type',
} as const;

export type TariffSearchParams = SearchParams<'name' | 'type'> & {
  type?: 'leasing' | 'subscription';
};

export interface TariffRepository extends Repository<TariffEntity, TariffSearchParams> {
  count(params?: TariffSearchParams): Promise<number>;
}

export default {
  async find(params: TariffSearchParams): Promise<TariffEntity[]> {
    try {
      const rows = await db
        .selectFrom('subscriptions')
        .selectAll()
        .$if(Boolean(params?.type), (q) => q.where('type', '=', params.type!))
        .$if(Boolean(params?.sortField && SORT_FIELD_MAP[params.sortField!]), (query) =>
          query.orderBy(SORT_FIELD_MAP[params.sortField!], params.sortOrder),
        )
        .$if(Boolean(params?.limit), (query) => query.limit(params.limit!))
        .$if(Boolean(params?.offset), (query) => query.offset(params.offset!))
        .execute();

      return rows.map((row) => createTariffEntity(row));
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async findOne(id: string): Promise<TariffEntity | null> {
    try {
      const row = await db
        .selectFrom('subscriptions')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();

      return row ? createTariffEntity(row) : null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async insert(entity: TariffEntity): Promise<string | null> {
    try {
      const result = await db
        .insertInto("subscriptions")
        .values(createTariffTable(entity))
        .returning("id")
        .executeTakeFirst();

      return result?.id ?? null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async update(entity: Partial<TariffEntity> & { id: string }): Promise<string | null> {
    try {
      const tariffUpdates = createTariffUpdates(entity);

      if (Object.keys(tariffUpdates).length === 0) return entity.id;

      const result = await db
        .updateTable("subscriptions")
        .set(tariffUpdates)
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
        .deleteFrom("subscriptions")
        .where("id", "=", id)
        .returning("id")
        .executeTakeFirst();

      return result?.id ?? null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async count(params?: TariffSearchParams): Promise<number> {
    try {
      const result = await db
        .selectFrom('subscriptions')
        .select((eb) => eb.fn.countAll().as('total'))
        .$if(Boolean(params?.type), (q) => q.where('type', '=', params!.type!))
        .executeTakeFirst();
      return Number(result?.total ?? 0);
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },
} satisfies TariffRepository;
