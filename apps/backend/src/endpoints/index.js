import domain from '../domain/services';

import { createCarEndpoint } from './car';
import { createAuthEndpoint } from './auth';

export default {
  cars: createCarEndpoint(domain),
  auth: createAuthEndpoint(domain),
};
