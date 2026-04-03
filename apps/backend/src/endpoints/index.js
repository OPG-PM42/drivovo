import { createCarService } from '../domain/services';
import { createMockCarRepository } from '../infrastructure/car.repository';

import { createCarEndpoint } from './car';

const carRepository = createMockCarRepository();
const domain = {
  cars: createCarService({ cars: carRepository }),
};

export default {
  cars: createCarEndpoint(domain),
};