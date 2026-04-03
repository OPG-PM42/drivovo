import { ServiceError } from '../../errors';

export const createCarService = (infra) => ({
  find: async (params = {}) => {
    try {
      return await infra.cars.find(params);
    } catch (err) {
      throw new ServiceError('CARS_FETCH_FAILED', 'Failed to retrieve cars', err);
    }
  },
});
