const errorMap = {
  VALIDATION_ERROR: { code: 400, message: 'Validation failed' },
  NOT_FOUND: { code: 404, message: 'Car not found' },
  UNKNOWN_ERROR: { code: 500, message: 'Internal server error' },
};

export const createCarEndpoint = (domain) => [
  {
    path: "/",
    method: "GET",
    handler: ({ query }) => domain.cars.getAll(query),
    errors: errorMap,
  },
  {
    path: "/:id",
    method: "GET",
    handler: ({ id }) => domain.cars.getById(id),
    errors: errorMap,
  },
];
