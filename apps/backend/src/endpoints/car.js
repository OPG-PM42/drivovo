export const createCarEndpoint = (domain) => [
    {
        path: '/',
        method: 'GET',
        handler: domain.cars.find
    }
];
