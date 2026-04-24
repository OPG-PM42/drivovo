import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import { createCookies } from './cookies';
import type { Endpoint, EndpointMap, HttpContext } from './types';

export interface ServerOptions {
  port?: number;
  host?: string;
  endpointMap: EndpointMap;
}

function joinUrl(namespace: string, path: string) {
  const head = `/${namespace}`;
  if (path === '/' || path === '') return head;
  return path.startsWith('/') ? `${head}${path}` : `${head}/${path}`;
}

export async function runServer({
  port = 3000,
  host = '0.0.0.0',
  endpointMap,
}: ServerOptions): Promise<void> {
  const app = Fastify();
  await app.register(fastifyCookie);

  for (const [namespace, endpoints] of Object.entries(endpointMap)) {
    for (const endpoint of endpoints as Endpoint[]) {
      app.route({
        method: endpoint.method,
        url: joinUrl(namespace, endpoint.path),
        handler: async (request, reply) => {
          try {
            const ctx: HttpContext = {
              headers: request.headers,
              query: request.query,
              body: request.body,
              params: request.params,
              cookies: createCookies(request, reply),
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
