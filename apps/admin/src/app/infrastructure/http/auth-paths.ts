/**
 * Path suffix for the bootstrap "current admin" endpoint.
 * Single source of truth: used by HttpAuthRepository.getCurrentAdmin()
 * AND by error.interceptor 401 exclusion logic to avoid forced sign-out
 * during initial session probe.
 */
export const AUTH_ME_PATH = '/auth/me';
