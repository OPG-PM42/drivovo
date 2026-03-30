import domain from '../domain/services/index.js';

import { createCarEndpoint } from './car';

export default {
  cars: createCarEndpoint(domain),
}; 