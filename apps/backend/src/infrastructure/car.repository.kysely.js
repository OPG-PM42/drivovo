import { RepositoryError } from '../errors';

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

function groupBy(array, key) {
  return array.reduce((acc, item) => {
    const group = item[key];
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});
}

function mapCarRow(row, imagesByCarId, priceByCarId) {
  const images = (imagesByCarId[row.id] || []).map((img) => ({
    url: img.url,
    alt: img.alt,
    width: img.width,
    height: img.height,
    parentId: img.parent_id,
  }));

  const priceRow = priceByCarId[row.id];
  const price = priceRow
    ? {
        value: Number(priceRow.value),
        currency: priceRow.currency,
        countryId: priceRow.country_id,
        carId: priceRow.car_id,
      }
    : null;

  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    images,
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
    price,
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

      if (cars.length === 0) return [];

      const carIds = cars.map((c) => c.id);

      const images = await db
        .selectFrom('images')
        .selectAll()
        .where('parent_id', 'in', carIds)
        .where('parent_type', '=', 'car')
        .execute()
        .catch(() => []);

      const prices = await db
        .selectFrom('car_prices')
        .selectAll()
        .where('car_id', 'in', carIds)
        .execute()
        .catch(() => []);

      const imagesByCarId = groupBy(images, 'parent_id');
      const priceByCarId = Object.fromEntries(prices.map((p) => [p.car_id, p]));

      return cars.map((car) => mapCarRow(car, imagesByCarId, priceByCarId));
    } catch (err) {
      throw new RepositoryError('Failed to fetch cars', err);
    }
  },
});
