export const createCarEndpoint = (domain) => [
    {
        path: '/',
        method: 'GET',
        handler: async (params, query) => {
            const data = await domain.cars.find(params, query);
            return { data, code: 200 };
        }
    }
];