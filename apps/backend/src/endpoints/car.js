export const createCarEndpoint = (domain) => [
    {
        path: '/',
        method: 'GET',
        access: 'public',
        handler: () => domain.cars.getAll()
    }
];
