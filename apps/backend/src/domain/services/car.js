import { ServiceError } from '../../errors';

export const createCarService = (infra) => ({
  find: async (params = {}) => {
    try {
      return await infra.cars.find(params);
    } catch (err) {
      const code = err.code || 'CARS_FETCH_FAILED';
      throw new ServiceError(code, err.message || 'Failed to retrieve cars', err);
    }
  },
});
