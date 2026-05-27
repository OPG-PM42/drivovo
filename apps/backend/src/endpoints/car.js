const errorMap = {
  VALIDATION_ERROR: { code: 400, message: 'Validation failed' },
  NOT_FOUND: { code: 404, message: 'Car not found' },
  UNKNOWN_ERROR: { code: 500, message: 'Internal server error' },
};

export const createCarEndpoint = (domain) => [
  {
    path: '/',
    method: 'GET',
    access: 'public',
    handler: ({ query }) => domain.cars.getAll(query),
    errors: errorMap,
  },
  {
    path: '/:id',
    method: 'GET',
    access: 'public',
    handler: ({ id }) => domain.cars.getById(id),
    errors: errorMap,
  },
  {
    path: '/',
    method: 'POST',
    access: 'public',
    handler: ({ body }) => domain.cars.create(body),
    errors: errorMap,
  },
];
