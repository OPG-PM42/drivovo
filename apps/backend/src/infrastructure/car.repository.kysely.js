import { RepositoryError } from '../errors/repository.error.js';

const FILTER_MAP = {
  brand: 'brand',
  type: 'type',
  status: 'status',
  driveType: 'drive_type',
  color: 'color',
};

const SORT_COLUMN_MAP = {
  name: 'name',
  brand: 'brand',
  type: 'type',
  status: 'status',
  driveType: 'drive_type',
  color: 'color',
};

/** Maps a snake_case DB row to a camelCase CarEntity. */
function mapCarRow(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    description: row.description,
    driveType: row.drive_type,
    type: row.type,
    url: row.url,
    acceleration: row.acceleration,
    power: row.power,
    engine: {
      type: row.engine_type,
      capacity: row.engine_capacity,
      fuel_consumption: row.engine_fuel_cons,
    },
    interiorTrim: row.interior_trim,
    status: row.status,
    color: row.color,
  };
}

export const createCarRepository = (db) => ({
  find: async (params = {}) => {
    try {
      let query = db.selectFrom('cars').selectAll();

      for (const [param, column] of Object.entries(FILTER_MAP)) {
        if (params[param]) {
          query = query.where(column, '=', params[param]);
        }
      }

      if (params.sortField) {
        const sortCol = SORT_COLUMN_MAP[params.sortField] || 'name';
        query = query.orderBy(sortCol, params.sortOrder === 'DESC' ? 'desc' : 'asc');
      }

      if (params.limit) query = query.limit(params.limit);
      if (params.offset) query = query.offset(params.offset);

      const cars = await query.execute();

      return cars.map(mapCarRow);
    } catch (err) {
      throw RepositoryError.from(err);
    }
  },
});
