import Fastify, { FastifyError, FastifyInstance } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
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

export async function buildApp({
  endpointMap,
  authProvider,
  config,
}: ServerOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });
  await app.register(fastifyCookie);

  await app.register(swagger, {
    openapi: {
      info: { title: 'Drivovo API', version: '1.0.0' },
      components: { securitySchemes: {} },
    },
  });

  if (process.env['SWAGGER_ENABLED'] !== 'false') {
    await app.register(swaggerUi, { routePrefix: '/docs' });
  }

  const cookieName = config?.session?.cookieName ?? DEFAULT_COOKIE_NAME;
  const maxAge = config?.session?.maxAgeSeconds ?? DEFAULT_MAX_AGE_SECONDS;
  const isProd = process.env['NODE_ENV'] === 'production';

  app.setErrorHandler((err: FastifyError, _req, reply) => {
    if (err.validation) {
      return reply
        .status(400)
        .send({ code: 'VALIDATION_ERROR', error: err.validation });
    }
    reply
      .status(err.statusCode ?? 500)
      .send(
        err.statusCode
          ? { code: err.code ?? 'ERROR', error: err.message }
          : { error: 'Internal Server Error' },
      );
  });

  app.get('/health', async () => ({ status: 'ok' }));

  for (const [namespace, endpoints] of Object.entries(endpointMap)) {
    for (const endpoint of endpoints as Endpoint[]) {
      app.route({
        method: endpoint.method,
        url: joinUrl(namespace, endpoint.path),
        ...(endpoint.schema ? { schema: endpoint.schema } : {}),
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
          } catch (err: unknown) {
            const code = err != null && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : undefined;
            if (code && endpoint.errors?.[code]) {
              const info = endpoint.errors[code];
              return reply
                .status(info.code)
                .send({ code, error: info.message });
            }
            request.log.error(err);
            return reply.status(500).send({ error: 'Internal Server Error' });
          }
        },
      });
    }
  }

  return app;
}

export async function runServer(opts: ServerOptions): Promise<void> {
  const { port = 3000, host = '0.0.0.0' } = opts;
  const app = await buildApp(opts);
  await app.listen({ port, host });
}
