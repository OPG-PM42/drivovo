export interface CookieOptions {
  domain?: string;
  path?: string;
  expires?: Date;
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export interface Cookies {
  get(name: string): string | undefined;
  set(name: string, value: string, options?: CookieOptions): void;
  delete(name: string, options?: Pick<CookieOptions, 'domain' | 'path'>): void;
}

export type HttpHeaders = Readonly<
  Record<string, string | string[] | undefined>
>;

export interface HttpContext<
  Body = unknown,
  Query = unknown,
  Params = unknown,
> {
  headers: HttpHeaders;
  query: Query;
  body: Body;
  params: Params;
  cookies: Cookies;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface EndpointError {
  code: number;
  message: string;
}

export type EndpointHandler<B, Q, P, R> = (
  ctx: HttpContext<B, Q, P>,
) => Promise<R> | R;

export interface Endpoint<
  B = unknown,
  Q = unknown,
  P = unknown,
  R = unknown,
> {
  path: string;
  method: HttpMethod;
  handler: EndpointHandler<B, Q, P, R>;
  errors?: Record<string, EndpointError>;
}

export type EndpointMap = Record<string, Endpoint[]>;
