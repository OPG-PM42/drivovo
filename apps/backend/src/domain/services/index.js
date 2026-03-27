import { createCarService } from './car';
import { createCarRepository } from '../../../../../libs/database/src/repositories/pg-car.repository';
import { pool } from '../../../../../libs/database/src/client/pool';

const carRepository = createCarRepository(pool);

export default {
  cars: createCarService({ cars: carRepository }),
};
