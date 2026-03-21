export const createCarService = (infra) => ({
  find: async (params, query = {}) => infra.cars.find(query)
});
