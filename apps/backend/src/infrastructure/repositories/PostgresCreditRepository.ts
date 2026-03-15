import type { CreditEntity } from 'domain';
import type { Pool } from '../pg/mock-pg';
import type {
  ICreditRepository,
  CreateCreditDto,
  UpdateCreditDto,
} from '../../application/repositories/ICreditRepository';

interface CreditRow {
  id: string;
  status: CreditEntity['status'];
  term: number;
  deposit_value: number;
  deposit_currency: string;
  created_at: string;
  updated_at: string;
  tariff_id: string;
  tariff_type: string;
  tariff_name: string;
  car_id: string;
  car_name: string;
  car_brand: string;
  country_id: string;
  country_name: string;
  country_iso2: string;
  country_iso3: string;
  country_phone_code: string;
  country_currency: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  user_driving_experience: number;
  user_came_from: string;
  user_availability: string;
  user_created_at: string;
  user_updated_at: string;
}

const SELECT_CREDIT_SQL = `
  SELECT
    c.id,
    c.status,
    c.term,
    c.deposit_value,
    c.deposit_currency,
    c.created_at,
    c.updated_at,
    t.id            AS tariff_id,
    t.type          AS tariff_type,
    t.name          AS tariff_name,
    ca.id           AS car_id,
    ca.name         AS car_name,
    ca.brand        AS car_brand,
    co.id           AS country_id,
    co.name         AS country_name,
    co.iso2         AS country_iso2,
    co.iso3         AS country_iso3,
    co.phone_code   AS country_phone_code,
    co.currency     AS country_currency,
    u.id            AS user_id,
    u.name          AS user_name,
    u.email         AS user_email,
    u.phone         AS user_phone,
    u.driving_experience AS user_driving_experience,
    u.came_from     AS user_came_from,
    u.availability  AS user_availability,
    u.created_at    AS user_created_at,
    u.updated_at    AS user_updated_at
  FROM credits c
  JOIN tariffs t  ON t.id = c.tariff_id
  JOIN cars ca    ON ca.id = c.car_id
  JOIN countries co ON co.id = c.country_id
  JOIN users u    ON u.id = c.user_id
`;

const rowToEntity = (row: CreditRow): CreditEntity => ({
  id: row.id,
  status: row.status,
  term: row.term,
  deposit: {
    value: row.deposit_value,
    currency: row.deposit_currency,
  },
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  tariff: {
    id: row.tariff_id,
    type: row.tariff_type as CreditEntity['tariff']['type'],
    name: row.tariff_name,
    options: [],
  },
  car: {
    id: row.car_id,
    name: row.car_name,
    brand: row.car_brand,
  } as CreditEntity['car'],
  country: {
    id: row.country_id,
    name: row.country_name,
    iso2: row.country_iso2,
    iso3: row.country_iso3,
    phoneCode: row.country_phone_code,
    currency: row.country_currency,
  },
  user: {
    id: row.user_id,
    name: row.user_name,
    email: row.user_email,
    phone: row.user_phone,
    drivingExperience: row.user_driving_experience,
    cameFrom: row.user_came_from,
    availability: row.user_availability,
    createdAt: new Date(row.user_created_at),
    updatedAt: new Date(row.user_updated_at),
  },
});

export class PostgresCreditRepository implements ICreditRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<CreditEntity | null> {
    const { rows } = await this.pool.query<CreditRow>(
      `${SELECT_CREDIT_SQL} WHERE c.id = $1`,
      [id]
    );
    return rows[0] ? rowToEntity(rows[0]) : null;
  }

  async findAll(): Promise<CreditEntity[]> {
    const { rows } = await this.pool.query<CreditRow>(
      `${SELECT_CREDIT_SQL} ORDER BY c.created_at DESC`
    );
    return rows.map(rowToEntity);
  }

  async findByUserId(userId: string): Promise<CreditEntity[]> {
    const { rows } = await this.pool.query<CreditRow>(
      `${SELECT_CREDIT_SQL} WHERE c.user_id = $1 ORDER BY c.created_at DESC`,
      [userId]
    );
    return rows.map(rowToEntity);
  }

  async create(data: CreateCreditDto): Promise<CreditEntity> {
    const { rows } = await this.pool.query<{ id: string }>(
      `INSERT INTO credits
        (tariff_id, car_id, country_id, user_id, status, term, deposit_value, deposit_currency)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        data.tariffId,
        data.carId,
        data.countryId,
        data.userId,
        data.status,
        data.term,
        data.deposit.value,
        data.deposit.currency,
      ]
    );

    const created = await this.findById(rows[0].id);
    if (!created) throw new Error(`Credit ${rows[0].id} not found after insert`);
    return created;
  }

  async update(id: string, data: UpdateCreditDto): Promise<CreditEntity | null> {
    const setClauses: string[] = [];
    const params: unknown[] = [];

    if (data.status !== undefined) {
      params.push(data.status);
      setClauses.push(`status = $${params.length}`);
    }
    if (data.term !== undefined) {
      params.push(data.term);
      setClauses.push(`term = $${params.length}`);
    }
    if (data.deposit !== undefined) {
      params.push(data.deposit.value);
      setClauses.push(`deposit_value = $${params.length}`);
      params.push(data.deposit.currency);
      setClauses.push(`deposit_currency = $${params.length}`);
    }

    if (setClauses.length === 0) return this.findById(id);

    params.push(id);
    await this.pool.query(
      `UPDATE credits SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${params.length}`,
      params
    );

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM credits WHERE id = $1', [id]);
  }
}
