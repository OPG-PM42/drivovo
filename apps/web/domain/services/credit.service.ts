// import mongooseCarRepository, { type ICarRepository } from "../../application/repositories/car.repository";
import type { ICarRepository } from "../../application/repositories/car.repository";
import type { CreditEntity } from "../entities/credit";

export class CreditService {
    constructor(private readonly carRepository: ICarRepository) {}

    public async createCredit(credit: CreditEntity): Promise<CreditEntity> {
        const filteredCars = await this.carRepository.query('SElECT * ...');
        const cars = await this.carRepository.getAll();
        const car = cars.find((car) => car.id === credit.car.id);
        if (!car) {
            throw new Error('Car not found');
        }
        return {
            ...credit,
            car,
        };
    }
}

// export default new CreditService(mongooseCarRepository);