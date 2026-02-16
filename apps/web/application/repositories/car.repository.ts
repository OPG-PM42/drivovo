import type { CarEntity } from '../../domain/entities/car';
// import mongoose from '../../infrastructure/db';

export interface ICarRepository {
    getAll(): Promise<CarEntity[]>;
    get(id: string): Promise<CarEntity>;
    query(query: string): Promise<CarEntity[]>;
}

// class MongooseCarRepository implements ICarRepository {
//     async getAll(): Promise<CarEntity[]> {
//         return mongoose.collection('cars').find().toArray();
//     }
//
//     async get(id: string): Promise<CarEntity> {
//         return mongoose.collection('cars').findOne({ id });
//     }
//
//     async query(query: string): Promise<any> {
//         return mongoose.collection('cars').find(query).toArray();
//     }
// }
//
// export default new MongooseCarRepository();