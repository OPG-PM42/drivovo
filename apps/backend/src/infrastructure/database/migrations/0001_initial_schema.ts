import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  // Enum types
  await sql`CREATE TYPE availability_day AS ENUM ('today', 'tomorrow', 'weekend')`.execute(db);
  await sql`CREATE TYPE availability_time AS ENUM ('morning', 'afternoon', 'evening')`.execute(db);
  await sql`CREATE TYPE car_status AS ENUM ('available', 'order')`.execute(db);
  await sql`CREATE TYPE car_type AS ENUM ('sedan', 'hatchback', 'suv', 'mpv', 'coupe', 'convertible', 'van', 'pickup', 'bus', 'other')`.execute(db);
  await sql`CREATE TYPE credit_status AS ENUM ('pending', 'approved', 'rejected')`.execute(db);
  await sql`CREATE TYPE drinks_type AS ENUM ('coffee', 'tea')`.execute(db);
  await sql`CREATE TYPE drive_type AS ENUM ('FWD', 'RWD', 'AWD')`.execute(db);
  await sql`CREATE TYPE driving_experience AS ENUM ('beginner', 'intermediate', 'advanced')`.execute(db);
  await sql`CREATE TYPE fuel_type AS ENUM ('petrol', 'diesel', 'electric', 'hybrid', 'other')`.execute(db);
  await sql`CREATE TYPE tariff_type AS ENUM ('leasing', 'subscription')`.execute(db);

  // Tables without FK dependencies
  await sql`
    CREATE TABLE countries (
      id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
      name varchar(100) NOT NULL,
      iso2 char(2) NOT NULL,
      iso3 char(3) NOT NULL,
      phone_code varchar(20),
      currency varchar(10) NOT NULL
    )
  `.execute(db);

  await sql`
    CREATE TABLE subscriptions (
      id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
      type tariff_type NOT NULL,
      name varchar(255) NOT NULL
    )
  `.execute(db);

  await sql`
    CREATE TABLE cars (
      id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
      name varchar(255) NOT NULL,
      brand varchar(100) NOT NULL,
      description text,
      drive_type drive_type NOT NULL,
      type car_type NOT NULL,
      url varchar(500),
      acceleration varchar(50),
      power varchar(50),
      color varchar(100),
      interior_trim varchar(255),
      status car_status DEFAULT 'available' NOT NULL,
      engine_type fuel_type NOT NULL,
      engine_capacity varchar(50),
      engine_fuel_cons varchar(50),
      images jsonb DEFAULT '[]' NOT NULL
    )
  `.execute(db);

  await sql`
    CREATE TABLE users (
      id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
      name varchar(100),
      email varchar(255),
      phone varchar(50),
      driving_experience driving_experience,
      came_from varchar(255),
      availability_day availability_day,
      availability_time availability_time,
      drinks drinks_type,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL
    )
  `.execute(db);

  // Tables with FK dependencies
  await sql`
    CREATE TABLE car_pages (
      id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
      car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
      title varchar(255) NOT NULL,
      description text,
      rating numeric(3,2),
      reviews jsonb DEFAULT '[]' NOT NULL,
      seo_title varchar(255),
      seo_description text,
      banners jsonb DEFAULT '[]' NOT NULL,
      CONSTRAINT car_pages_car_id_key UNIQUE (car_id)
    )
  `.execute(db);

  await sql`
    CREATE TABLE car_prices (
      id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
      car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
      country_id uuid NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
      value numeric(12,2) NOT NULL,
      currency varchar(10) NOT NULL,
      CONSTRAINT car_prices_car_id_country_id_key UNIQUE (car_id, country_id)
    )
  `.execute(db);

  await sql`
    CREATE TABLE orders (
      id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
      tariff_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
      car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
      country_id uuid NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
      name varchar(255) NOT NULL,
      price numeric(12,2) NOT NULL,
      currency varchar(10) NOT NULL,
      CONSTRAINT orders_tariff_id_car_id_country_id_key UNIQUE (tariff_id, car_id, country_id)
    )
  `.execute(db);

  await sql`
    CREATE TABLE credits (
      id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
      car_id uuid NOT NULL REFERENCES cars(id) ON DELETE RESTRICT,
      tariff_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE RESTRICT,
      country_id uuid NOT NULL REFERENCES countries(id) ON DELETE RESTRICT,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      status credit_status DEFAULT 'pending' NOT NULL,
      term integer,
      deposit_value numeric(12,2),
      deposit_currency varchar(10),
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL
    )
  `.execute(db);

  // Indexes
  await sql`CREATE UNIQUE INDEX idx_car_pages_car_id ON car_pages USING btree (car_id)`.execute(db);
  await sql`CREATE INDEX idx_car_pages_reviews_gin ON car_pages USING gin (reviews)`.execute(db);
  await sql`CREATE UNIQUE INDEX idx_car_prices_car_country ON car_prices USING btree (car_id, country_id)`.execute(db);
  await sql`CREATE INDEX idx_cars_brand ON cars USING btree (brand)`.execute(db);
  await sql`CREATE INDEX idx_cars_status ON cars USING btree (status)`.execute(db);
  await sql`CREATE INDEX idx_cars_type ON cars USING btree (type)`.execute(db);
  await sql`CREATE UNIQUE INDEX idx_countries_iso2 ON countries USING btree (iso2)`.execute(db);
  await sql`CREATE UNIQUE INDEX idx_countries_iso3 ON countries USING btree (iso3)`.execute(db);
  await sql`CREATE INDEX idx_credits_car_id ON credits USING btree (car_id)`.execute(db);
  await sql`CREATE INDEX idx_credits_created_at ON credits USING btree (created_at)`.execute(db);
  await sql`CREATE INDEX idx_credits_status ON credits USING btree (status)`.execute(db);
  await sql`CREATE INDEX idx_credits_user_id ON credits USING btree (user_id)`.execute(db);
  await sql`CREATE INDEX idx_orders_car_country ON orders USING btree (car_id, country_id)`.execute(db);
  await sql`CREATE INDEX idx_orders_country_id ON orders USING btree (country_id)`.execute(db);
  await sql`CREATE INDEX idx_orders_tariff_id ON orders USING btree (tariff_id)`.execute(db);
  await sql`CREATE UNIQUE INDEX idx_users_email ON users USING btree (email)`.execute(db);
  await sql`CREATE INDEX idx_users_phone ON users USING btree (phone)`.execute(db);

  // Views
  await sql`
    CREATE OR REPLACE VIEW car_page_entity AS
    SELECT
      cp.id          AS page_id,
      cp.title       AS page_title,
      cp.description AS page_description,
      cp.rating,
      cp.reviews,
      cp.seo_title,
      cp.seo_description,
      cp.banners,
      c.id           AS car_id,
      c.name         AS car_name,
      c.brand,
      c.description  AS car_description,
      c.drive_type,
      c.type         AS car_type,
      c.url          AS car_url,
      c.acceleration,
      c.power,
      c.color,
      c.interior_trim,
      c.status,
      c.engine_type,
      c.engine_capacity,
      c.engine_fuel_cons,
      c.images       AS car_images,
      pr.value       AS price_value,
      pr.currency    AS price_currency,
      pr.country_id  AS price_country_id
    FROM car_pages cp
    INNER JOIN cars c ON c.id = cp.car_id
    LEFT JOIN car_prices pr ON pr.car_id = c.id
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`DROP VIEW IF EXISTS car_page_entity`.execute(db);
  await sql`DROP TABLE IF EXISTS credits CASCADE`.execute(db);
  await sql`DROP TABLE IF EXISTS orders CASCADE`.execute(db);
  await sql`DROP TABLE IF EXISTS car_prices CASCADE`.execute(db);
  await sql`DROP TABLE IF EXISTS car_pages CASCADE`.execute(db);
  await sql`DROP TABLE IF EXISTS users CASCADE`.execute(db);
  await sql`DROP TABLE IF EXISTS cars CASCADE`.execute(db);
  await sql`DROP TABLE IF EXISTS subscriptions CASCADE`.execute(db);
  await sql`DROP TABLE IF EXISTS countries CASCADE`.execute(db);

  await sql`DROP TYPE IF EXISTS tariff_type`.execute(db);
  await sql`DROP TYPE IF EXISTS fuel_type`.execute(db);
  await sql`DROP TYPE IF EXISTS driving_experience`.execute(db);
  await sql`DROP TYPE IF EXISTS drive_type`.execute(db);
  await sql`DROP TYPE IF EXISTS drinks_type`.execute(db);
  await sql`DROP TYPE IF EXISTS credit_status`.execute(db);
  await sql`DROP TYPE IF EXISTS car_type`.execute(db);
  await sql`DROP TYPE IF EXISTS car_status`.execute(db);
  await sql`DROP TYPE IF EXISTS availability_time`.execute(db);
  await sql`DROP TYPE IF EXISTS availability_day`.execute(db);
}
