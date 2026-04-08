import type { ColumnType, Generated, JSONColumnType, Insertable, Updateable, OrderByModifiers } from 'kysely';
import type { CarPageEntity } from '@drivovo/domain';
import db from '../index';
import { createImage, createImageJson } from './image';
import type { ImageJson } from './image';
import { createReview, createReviewJson } from './review';
import type { ReviewJson } from './review';
import { createCarEntity } from './car';
import type { SearchParams } from '../../../repositories/repository';

const SORT_FIELD_MAP: Record<string, string> = {
  title: 'car_pages.title',
  rating: 'car_pages.rating',
};

export interface CarPagesTable {
  id: Generated<string>;
  car_id: string;
  title: string;
  description: string | null;
  rating: ColumnType<number, number | undefined, number | undefined>;
  reviews: JSONColumnType<ReviewJson[]>;
  seo_title: string | null;
  seo_description: string | null;
  banners: JSONColumnType<ImageJson[]>;
}

type PageRow = Awaited<ReturnType<ReturnType<typeof createCarPageQuery>['executeTakeFirstOrThrow']>>;


export function createCarPageTable(entity: CarPageEntity): Insertable<CarPagesTable> {
  return {
    car_id: entity.car.id,
    title: entity.title,
    description: entity.description || null,
    rating: entity.rating,
    reviews: JSON.stringify(entity.reviews.map(createReviewJson)),
    seo_title: entity.seo.title || null,
    seo_description: entity.seo.description || null,
    banners: JSON.stringify(entity.banners.map(createImageJson)),
  };
}

export function createCarPageEntity(row: PageRow): CarPageEntity {
  const price = row.price_value != null
    ? { value: row.price_value, currency: row.price_currency!, countryId: row.price_country_id!, carId: row.car_id }
    : undefined;

  const car = createCarEntity(
    { ...row, id: row.car_id, name: row.car_name, description: row.car_description, type: row.car_type, url: row.car_url, images: row.car_images },
    price,
  );

  return {
    id: row.page_id,
    title: row.page_title,
    description: row.page_description ?? '',
    rating: row.rating ?? 0,
    reviews: (row.reviews ?? []).map(createReview),
    banners: (row.banners ?? []).map(createImage),
    seo: {
      title: row.seo_title ?? '',
      description: row.seo_description ?? '',
    },
    car,
  };
}

export function createCarPageUpdates(entity: Partial<CarPageEntity>): Updateable<CarPagesTable> {
  const props = {
    car_id: entity?.car?.id,
    title: entity.title,
    description: entity.description,
    rating: entity.rating,
    reviews: entity.reviews ? JSON.stringify(entity.reviews.map(createReviewJson)) : undefined,
    seo_title: entity.seo?.title,
    seo_description: entity?.seo?.description,
    banners: entity?.banners ? JSON.stringify(entity.banners.map(createImageJson)) : undefined,
  };
  const result: Record<string, string | number | null> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) {
      result[key as keyof CarPagesTable] = value;
    }
  }
  return result;
}

export function createCarPageQuery(params?: SearchParams) {
  let query = db
    .selectFrom('car_pages')
    .innerJoin('cars', 'cars.id', 'car_pages.car_id')
    .leftJoin('car_prices', 'car_prices.car_id', 'cars.id')
    .select([
      'car_pages.id as page_id',
      'car_pages.title as page_title',
      'car_pages.description as page_description',
      'car_pages.rating',
      'car_pages.reviews',
      'car_pages.seo_title',
      'car_pages.seo_description',
      'car_pages.banners',
      'cars.id as car_id',
      'cars.name as car_name',
      'cars.brand',
      'cars.description as car_description',
      'cars.drive_type',
      'cars.type as car_type',
      'cars.url as car_url',
      'cars.acceleration',
      'cars.power',
      'cars.color',
      'cars.interior_trim',
      'cars.status',
      'cars.engine_type',
      'cars.engine_capacity',
      'cars.engine_fuel_cons',
      'cars.images as car_images',
      'car_prices.value as price_value',
      'car_prices.currency as price_currency',
      'car_prices.country_id as price_country_id',
    ]);

  if (params?.sortField && SORT_FIELD_MAP[params.sortField]) {
    query = query.orderBy(SORT_FIELD_MAP[params.sortField] as any, params.sortOrder?.toLowerCase() as OrderByModifiers);
  }
  if (params?.limit) query = query.limit(params.limit);
  if (params?.offset) query = query.offset(params.offset);

  return query;
}
