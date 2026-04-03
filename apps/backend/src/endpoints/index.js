import { createCarService } from '../domain/services';
import { createCarRepository } from '../infrastructure/car.repository.kysely';
import { db } from '../infrastructure/kysely';

import { createCarEndpoint } from './car';

const carRepository = createCarRepository(db);
const domain = {
  cars: createCarService({ cars: carRepository }),
};

export default {
  cars: createCarEndpoint(domain),
};