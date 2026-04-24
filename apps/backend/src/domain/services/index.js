import repositories from '../../repositories';
import createCarService from './car';

export default {
  cars: createCarService({ repositories }),
};