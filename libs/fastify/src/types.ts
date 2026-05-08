export type Access = 'public' | 'private';

export interface Session {
  token: string;
  data?: unknown;
  expiresAt: Date;
}

export interface AuthContext {
  session: Session | null;
  startSession(token: string, data?: unknown): Promise<Session>;
  endSession(): Promise<void>;
}

export interface AuthProvider {
  restoreSession(token: string): Promise<Session | null>;
  startSession(token: string, data?: unknown): Promise<Session>;
  endSession(token: string): Promise<void>;
}

export interface ServerConfig {
  session?: {
    cookieName?: string;
    maxAgeSeconds?: number;
  };
}

export interface HttpContext<
  Body = unknown,
  Query = unknown,
  Params = unknown,
> {
  body: Body;
  query: Query;
  params: Params;
  auth: AuthContext;
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
  access?: Access;
  handler: EndpointHandler<B, Q, P, R>;
  errors?: Record<string, EndpointError>;
}

export type EndpointMap = Record<string, Endpoint[]>;
