const CarService = require('../services/car.service');
const CarPgRepository = require('../infrostructure/repositories/car.pg.repository');

async function appRoutes (fastify) {
    fastify.get('/catalog', async () => {
        const strategy = 'postgres';
        const connection = await fastify.dbManager.get(strategy);
        const repository = null;

        if(strategy === 'postgres'){
            repository = new CarPgRepository(connection);
        }else{
            return {error: 'DataBasr connection error!'};
        }

        const service = new CarService(repository);
        return service.getCars();
     
    })
}

module.exports =  appRoutes;