import type { UserEntity, UserSearchParams, UserRepository } from 'domain';
import type { Pool } from '../pg/mock-pg';

/**
 * Maps camelCase sortField values from UserSearchParams to actual
 * database column names. Acts as a whitelist — any sortField not
 * listed here falls back to the default ('u.created_at').
 *
 * This prevents SQL injection: only known column names are
 * interpolated into the query, never raw user input.
 */
const SORT_FIELD_MAP: Record<string, string> = {
  name: 'u.name',
  email: 'u.email',
  phone: 'u.phone',
  drivingExperience: 'u.driving_experience',
  cameFrom: 'u.came_from',
  createdAt: 'u.created_at',
  updatedAt: 'u.updated_at',
};

const DEFAULT_SORT_COLUMN = 'u.created_at';

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  driving_experience: UserEntity['drivingExperience'];
  came_from: string;
  availability_day: string;
  availability_time: string;
  drinks: string | null;
  created_at: string;
  updated_at: string;
}

const SELECT_USER_SQL = `
  SELECT
    u.id,
    u.name,
    u.email,
    u.phone,
    u.driving_experience,
    u.came_from,
    u.availability_day,
    u.availability_time,
    u.drinks,
    u.created_at,
    u.updated_at
  FROM users u
`;

const rowToEntity = (row: UserRow): UserEntity => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  drivingExperience: row.driving_experience,
  cameFrom: row.came_from,
  availability: {
    day: row.availability_day as UserEntity['availability']['day'],
    time: row.availability_time as UserEntity['availability']['time'],
  },
  drinks: row.drinks as UserEntity['drinks'],
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

/**
 * PostgreSQL implementation of the domain UserRepository port.
 *
 * Implements the domain interface directly — there is no separate
 * application-layer interface. This follows clean architecture:
 *   Domain (port) ← Infrastructure (adapter)
 *
 * The Pool dependency is injected via the constructor so the
 * repository can be tested with a mock/stub pool and the connection
 * lifecycle is managed externally (e.g. by a DI container).
 */
export class PostgresUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  async findOne(id: string): Promise<UserEntity | null> {
    const { rows } = await this.pool.query<UserRow>(
      `${SELECT_USER_SQL} WHERE u.id = $1`,
      [id],
    );
    return rows[0] ? rowToEntity(rows[0]) : null;
  }

  async find(params: UserSearchParams): Promise<UserEntity[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (params.drivingExperience !== undefined) {
      values.push(params.drivingExperience);
      conditions.push(`u.driving_experience = $${values.length}`);
    }
    if (params.cameFrom !== undefined) {
      values.push(params.cameFrom);
      conditions.push(`u.came_from = $${values.length}`);
    }
    if (params.availabilityDay !== undefined) {
      values.push(params.availabilityDay);
      conditions.push(`u.availability_day = $${values.length}`);
    }
    if (params.availabilityTime !== undefined) {
      values.push(params.availabilityTime);
      conditions.push(`u.availability_time = $${values.length}`);
    }

    let sql = SELECT_USER_SQL;
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Safe sort: only allow whitelisted column names to prevent SQL injection.
    const sortColumn = SORT_FIELD_MAP[params.sortField ?? 'createdAt'] ?? DEFAULT_SORT_COLUMN;
    const sortOrder = params.sortOrder ?? 'DESC';
    sql += ` ORDER BY ${sortColumn} ${sortOrder}`;

    if (params.limit !== undefined) {
      values.push(params.limit);
      sql += ` LIMIT $${values.length}`;
    }
    if (params.offset !== undefined) {
      values.push(params.offset);
      sql += ` OFFSET $${values.length}`;
    }

    const { rows } = await this.pool.query<UserRow>(sql, values);
    return rows.map(rowToEntity);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const { rows } = await this.pool.query<UserRow>(
      `${SELECT_USER_SQL} WHERE u.email = $1`,
      [email],
    );
    return rows[0] ? rowToEntity(rows[0]) : null;
  }

  async findByPhone(phone: string): Promise<UserEntity | null> {
    const { rows } = await this.pool.query<UserRow>(
      `${SELECT_USER_SQL} WHERE u.phone = $1`,
      [phone],
    );
    return rows[0] ? rowToEntity(rows[0]) : null;
  }

  async insert(data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const { rows } = await this.pool.query<{ id: string }>(
      `INSERT INTO users
        (name, email, phone, driving_experience, came_from, availability_day, availability_time, drinks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        data.name,
        data.email,
        data.phone,
        data.drivingExperience,
        data.cameFrom,
        data.availability.day,
        data.availability.time,
        data.drinks ?? null,
      ],
    );

    return rows[0].id;
  }

  async update(
    id: string,
    data: Partial<Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<void> {
    const setClauses: string[] = [];
    const params: unknown[] = [];

    if (data.name !== undefined) {
      params.push(data.name);
      setClauses.push(`name = $${params.length}`);
    }
    if (data.email !== undefined) {
      params.push(data.email);
      setClauses.push(`email = $${params.length}`);
    }
    if (data.phone !== undefined) {
      params.push(data.phone);
      setClauses.push(`phone = $${params.length}`);
    }
    if (data.drivingExperience !== undefined) {
      params.push(data.drivingExperience);
      setClauses.push(`driving_experience = $${params.length}`);
    }
    if (data.cameFrom !== undefined) {
      params.push(data.cameFrom);
      setClauses.push(`came_from = $${params.length}`);
    }
    if (data.availability !== undefined) {
      params.push(data.availability.day);
      setClauses.push(`availability_day = $${params.length}`);
      params.push(data.availability.time);
      setClauses.push(`availability_time = $${params.length}`);
    }
    if (data.drinks !== undefined) {
      params.push(data.drinks);
      setClauses.push(`drinks = $${params.length}`);
    }

    if (setClauses.length === 0) return;

    params.push(id);
    await this.pool.query(
      `UPDATE users SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${params.length}`,
      params,
    );
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM users WHERE id = $1', [id]);
  }
}
