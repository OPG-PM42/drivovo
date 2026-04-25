const errorMap = {
  VALIDATION_ERROR: { code: 400, message: 'Validation failed' },
  NOT_FOUND: { code: 404, message: 'Car not found' },
  UNKNOWN_ERROR: { code: 500, message: 'Internal server error' },
};

export const createCarEndpoint = (domain) => [
  {
    path: "/",
    method: "GET",
    handler: domain.cars.getAll,
  },
  {
    path: "/:id",
    method: "GET",
    handler: ({ id }) => domain.cars.getById(id),
  },
  {
    path: "/",
    method: "POST",
    handler: (ctx) => domain.cars.create(ctx.body),
    errors: errorMap,
  },
];
