import type { CarEntity } from "@drivovo/domain";
import db from "../infrastructure/database";
import {
  createCarTable,
  createCarUpdates,
  createCarEntity,
} from "../infrastructure/database/tables";
import type { Repository, SearchParams } from "./repository";
import { DATABASE_ERRORS, RepositoryError } from "../infrastructure/database/errors";

const SORT_FIELD_MAP = {
  name: 'name',
  brand: 'brand',
  status: 'status',
} as const;

type CarSearchParams = SearchParams<'name' | 'brand' | 'status'>;
interface CarRepository extends Repository<CarEntity, CarSearchParams> {}

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
      throw RepositoryError.create(error);
    }
  },

  async findOne(id: string): Promise<CarEntity> {
    try {
      const row = await db
        .selectFrom('cars')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirstOrThrow(
          () => new RepositoryError(
            DATABASE_ERRORS.NOT_FOUND_ERROR,
            `Car with id ${id} not found`
          )
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
