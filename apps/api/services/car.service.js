class CarService {
    constructor(repository){
        this.repository = repository;
    }

    async getCars () {
        return this.repository.getAllCars();
    }
}

module.exports = CarService;