-- =============================================
-- SCHEMA: drivovo
-- PostgreSQL 16+, UUID keys, clean normalized
-- =============================================

-- =============================================
-- ENUM Types
-- =============================================

CREATE TYPE fuel_type AS ENUM ('petrol', 'diesel', 'electric', 'hybrid', 'other');
CREATE TYPE car_status AS ENUM ('available', 'order');
CREATE TYPE car_type AS ENUM (
    'sedan', 'hatchback', 'suv', 'mpv',
    'coupe', 'convertible', 'van', 'pickup', 'bus', 'other'
);
CREATE TYPE drive_type AS ENUM ('FWD', 'RWD', 'AWD');
CREATE TYPE driving_experience AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE availability_day AS ENUM ('today', 'tomorrow', 'weekend');
CREATE TYPE availability_time AS ENUM ('morning', 'afternoon', 'evening');
CREATE TYPE drinks_type AS ENUM ('coffee', 'tea');
CREATE TYPE tariff_type AS ENUM ('leasing', 'subscription');
CREATE TYPE credit_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE image_parent_type AS ENUM ('car', 'car_page_banner');

-- =============================================
-- countries
-- =============================================

CREATE TABLE countries (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL,
    iso2       CHAR(2)     NOT NULL,
    iso3       CHAR(3)     NOT NULL,
    phone_code VARCHAR(20),
    currency   VARCHAR(10) NOT NULL
);

CREATE UNIQUE INDEX idx_countries_iso2 ON countries(iso2);
CREATE UNIQUE INDEX idx_countries_iso3 ON countries(iso3);

-- =============================================
-- users
-- =============================================

CREATE TABLE users (
    id          UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100),
    email       VARCHAR(255),
    phone       VARCHAR(50),
    driving_exp driving_experience,
    came_from   VARCHAR(255),
    avail_day   availability_day,
    avail_time  availability_time,
    drinks      drinks_type,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX        idx_users_phone ON users(phone);

-- =============================================
-- cars  (engine embedded as columns)
-- =============================================

CREATE TABLE cars (
    id               UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(255) NOT NULL,
    brand            VARCHAR(100) NOT NULL,
    description      TEXT,
    drive_type       drive_type  NOT NULL,
    type             car_type    NOT NULL,
    url              VARCHAR(500),
    acceleration     VARCHAR(50),
    power            VARCHAR(50),
    color            VARCHAR(100),
    interior_trim    VARCHAR(255),
    status           car_status  NOT NULL DEFAULT 'available',
    -- Engine (Value Object embedded)
    engine_type      fuel_type   NOT NULL,
    engine_capacity  VARCHAR(50),
    engine_fuel_cons VARCHAR(50)
);

CREATE INDEX idx_cars_brand  ON cars(brand);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_cars_type   ON cars(type);

-- =============================================
-- car_prices  (Price Value Object, 1 row per Car × Country)
-- =============================================

CREATE TABLE car_prices (
    id         UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id     UUID           NOT NULL REFERENCES cars(id)      ON DELETE CASCADE,
    country_id UUID           NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    value      DECIMAL(12, 2) NOT NULL,
    currency   VARCHAR(10)    NOT NULL,
    UNIQUE (car_id, country_id)
);

CREATE UNIQUE INDEX idx_car_prices_car_country ON car_prices(car_id, country_id);

-- =============================================
-- images  (Image Value Object, polymorphic parent)
-- =============================================

CREATE TABLE images (
    id          UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id   UUID               NOT NULL,
    parent_type image_parent_type  NOT NULL,
    url         VARCHAR(500)       NOT NULL,
    alt         VARCHAR(255),
    width       INT,
    height      INT
);

CREATE INDEX idx_images_parent ON images(parent_id, parent_type);

-- =============================================
-- tariffs
-- =============================================

CREATE TABLE tariffs (
    id   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    type tariff_type NOT NULL,
    name VARCHAR(255) NOT NULL
);

-- =============================================
-- tariff_options  (Option Value Object, Tariff × Car × Country)
-- =============================================

CREATE TABLE tariff_options (
    id         UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    tariff_id  UUID           NOT NULL REFERENCES tariffs(id)   ON DELETE CASCADE,
    car_id     UUID           NOT NULL REFERENCES cars(id)      ON DELETE CASCADE,
    country_id UUID           NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    name       VARCHAR(255)   NOT NULL,
    price      DECIMAL(12, 2) NOT NULL,
    currency   VARCHAR(10)    NOT NULL,
    UNIQUE (tariff_id, car_id, country_id)
);

CREATE INDEX idx_tariff_options_tariff_id  ON tariff_options(tariff_id);
CREATE INDEX idx_tariff_options_car_country ON tariff_options(car_id, country_id);
CREATE INDEX idx_tariff_options_country_id ON tariff_options(country_id);

-- =============================================
-- credits  (deposit Money embedded as columns)
-- =============================================

CREATE TABLE credits (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id           UUID          NOT NULL REFERENCES cars(id)      ON DELETE RESTRICT,
    tariff_id        UUID          NOT NULL REFERENCES tariffs(id)   ON DELETE RESTRICT,
    country_id       UUID          NOT NULL REFERENCES countries(id) ON DELETE RESTRICT,
    user_id          UUID          NOT NULL REFERENCES users(id)     ON DELETE RESTRICT,
    status           credit_status NOT NULL DEFAULT 'pending',
    term             INT,
    -- Deposit (Money Value Object embedded)
    deposit_value    DECIMAL(12, 2),
    deposit_currency VARCHAR(10),
    created_at       TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at       TIMESTAMP     NOT NULL DEFAULT now()
);

CREATE INDEX idx_credits_user_id    ON credits(user_id);
CREATE INDEX idx_credits_car_id     ON credits(car_id);
CREATE INDEX idx_credits_status     ON credits(status);
CREATE INDEX idx_credits_created_at ON credits(created_at);

-- =============================================
-- car_pages  (seo embedded as columns, 1:1 with car)
-- =============================================

CREATE TABLE car_pages (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id          UUID         NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    rating          DECIMAL(3, 2),
    -- SEO (Value Object embedded)
    seo_title       VARCHAR(255),
    seo_description TEXT,
    UNIQUE (car_id)
);

CREATE UNIQUE INDEX idx_car_pages_car_id ON car_pages(car_id);

-- =============================================
-- reviews  (1:N with car_pages)
-- =============================================

CREATE TABLE reviews (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    car_page_id  UUID         NOT NULL REFERENCES car_pages(id) ON DELETE CASCADE,
    rating       INT          NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment      TEXT,
    author       VARCHAR(255),
    author_image VARCHAR(500),
    created_at   TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_car_page_id      ON reviews(car_page_id);
CREATE INDEX idx_reviews_car_page_created ON reviews(car_page_id, created_at DESC);
