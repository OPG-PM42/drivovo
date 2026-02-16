import dotenv from 'dotenv';
import { join } from 'path';

// Load .env from root directory
dotenv.config({ path: join(__dirname, '../../../../.env') });

export const config = {
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'drivovo',
  },
  api: {
    port: parseInt(process.env.API_PORT || '3001'),
    host: process.env.API_HOST || '0.0.0.0',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
};
