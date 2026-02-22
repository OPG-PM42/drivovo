import domain from '../domain/services';

import { createCarEndpoint } from './car';

export default {
  cars: createCarEndpoint(domain),
}; 