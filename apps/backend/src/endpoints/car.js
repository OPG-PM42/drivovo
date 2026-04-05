import { dbErrors } from './http-error-map.js';

export const createCarEndpoint = (domain) => [
    {
        path: '/',
        method: 'GET',
        handler: domain.cars.find,
        errors: {
            CARS_FETCH_FAILED: { code: 500, message: 'Failed to retrieve cars' },
            ...dbErrors,
        },
    }
];
