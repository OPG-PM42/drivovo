import type { ColumnType, Generated, JSONColumnType, Insertable, Selectable, Updateable } from 'kysely';
import type { CarPageEntity } from '@drivovo/domain';
import { createImage, createImageJson } from './image';
import type { ImageJson } from './image';
import { createReview, createReviewJson } from './review';
import type { ReviewJson } from './review';
import { createCarEntity } from './car';
import type { CarStatus, CarType, DriveType, FuelType } from './car';

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

export interface CarPageEntityView {
  page_id: string;
  page_title: string;
  page_description: string | null;
  rating: number | null;
  reviews: ReviewJson[];
  seo_title: string | null;
  seo_description: string | null;
  banners: ImageJson[];
  car_id: string;
  car_name: string;
  brand: string;
  car_description: string | null;
  drive_type: DriveType;
  car_type: CarType;
  car_url: string | null;
  acceleration: string | null;
  power: string | null;
  color: string | null;
  interior_trim: string | null;
  status: CarStatus;
  engine_type: FuelType;
  engine_capacity: string | null;
  engine_fuel_cons: string | null;
  car_images: ImageJson[];
  price_value: number | null;
  price_currency: string | null;
  price_country_id: string | null;
}

type PageRow = Selectable<CarPageEntityView>;


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

