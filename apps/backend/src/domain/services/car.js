export const createCarService = (infra) => ({
  find: async (params = {}) => infra.cars.find(params)
});
