import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import type {
  AuthContext,
  AuthProvider,
  Endpoint,
  EndpointMap,
  HttpContext,
  ServerConfig,
  Session,
} from './types';

export interface ServerOptions {
  port?: number;
  host?: string;
  endpointMap: EndpointMap;
  authProvider: AuthProvider;
  config?: ServerConfig;
}

const DEFAULT_COOKIE_NAME = 'session';
const DEFAULT_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function joinUrl(namespace: string, path: string) {
  const head = `/${namespace}`;
  if (path === '/' || path === '') return head;
  return path.startsWith('/') ? `${head}${path}` : `${head}/${path}`;
}

export async function runServer({
  port = 3000,
  host = '0.0.0.0',
  endpointMap,
  authProvider,
  config,
}: ServerOptions): Promise<void> {
  const app = Fastify();
  await app.register(fastifyCookie);

  const cookieName = config?.session?.cookieName ?? DEFAULT_COOKIE_NAME;
  const maxAge = config?.session?.maxAgeSeconds ?? DEFAULT_MAX_AGE_SECONDS;
  const isProd = process.env['NODE_ENV'] === 'production';

  for (const [namespace, endpoints] of Object.entries(endpointMap)) {
    for (const endpoint of endpoints as Endpoint[]) {
      app.route({
        method: endpoint.method,
        url: joinUrl(namespace, endpoint.path),
        handler: async (request, reply) => {
          try {
            const token = request.cookies[cookieName];
            let session: Session | null = null;
            if (token) {
              session = await authProvider.restoreSession(token);
              if (!session) reply.clearCookie(cookieName, { path: '/' });
            }

            if (endpoint.access === 'private' && !session) {
              return reply.status(401).send({
                code: 'UNAUTHORIZED',
                error: 'Authentication required',
              });
            }

            const auth: AuthContext = {
              session,
              async startSession(token, data) {
                const created = await authProvider.startSession(token, data);
                reply.setCookie(cookieName, created.token, {
                  httpOnly: true,
                  sameSite: 'lax',
                  secure: isProd,
                  path: '/',
                  maxAge,
                });
                return created;
              },
              async endSession() {
                if (session) await authProvider.endSession(session.token);
                reply.clearCookie(cookieName, { path: '/' });
              },
            };

            const ctx: HttpContext = {
              body: request.body,
              query: request.query,
              params: request.params,
              auth,
            };
            const response = await endpoint.handler(ctx);
            return reply.send(response);
          } catch (err: any) {
            if (err.code && endpoint.errors?.[err.code!]) {
              const info = endpoint.errors[err.code!];
              return reply
                .status(info.code)
                .send({ code: err.code, error: info.message });
            }
            request.log.error(err);
            return reply.status(500).send({ error: 'Internal Server Error' });
          }
        },
      });
    }
  }

  await app.listen({ port, host });
}
