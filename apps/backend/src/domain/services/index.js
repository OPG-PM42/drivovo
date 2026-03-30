import { createCarService } from './car';
import { createCarRepository } from '../../repositories/car.repository';

const carRepository = createCarRepository();

export default {
  cars: createCarService({ cars: carRepository }),
};
