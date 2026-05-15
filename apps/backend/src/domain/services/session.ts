import type { Session } from '@drivovo/fastify';
import { type Dependencies } from './service';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface SessionService {
  start(token: string, data?: unknown): Promise<Session>;
  restore(token: string): Promise<Session | null>;
  end(token: string): Promise<void>;
}

export default ({ repositories: repos }: Dependencies): SessionService => ({
  async start(token, data) {
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await repos.sessions.insert({ token, data, expiresAt });
    return { token, data, expiresAt };
  },

  async restore(token) {
    const row = await repos.sessions.findByToken(token);
    if (!row) return null;
    if (row.expiresAt.getTime() < Date.now()) {
      await repos.sessions.delete(token);
      return null;
    }
    return { token: row.token, data: row.data, expiresAt: row.expiresAt };
  },

  async end(token) {
    await repos.sessions.delete(token);
  },
});
