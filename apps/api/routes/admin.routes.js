async function adminRoutes (fastify, options) {
    fastify.get('/1', async () => {
        return {data: '1 admin ready ok!'}
    })
    fastify.get('/2', async () => {
        return {data: '2 admin ready ok!'}
    })
    fastify.get('/3', async () => {
        return {data: '3 admin ready ok!'}
    })
}

module.exports =  adminRoutes;