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
];
