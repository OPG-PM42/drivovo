class CarPgRepository {
    constructor(pool){
        this.pool = pool;
    }
    async getAllCars() {
        const result = await this.pool.query('SELECT * FROM DrivovoCar');
        return result.rows;
    }
}

module.exports = CarPgRepository;