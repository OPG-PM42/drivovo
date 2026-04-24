import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Cookies } from './types';

export function createCookies(
  request: FastifyRequest,
  reply: FastifyReply,
): Cookies {
  return {
    get(name) {
      return request.cookies[name];
    },
    set(name, value, options) {
      reply.setCookie(name, value, options);
    },
    delete(name, options) {
      reply.clearCookie(name, options);
    },
  };
}
