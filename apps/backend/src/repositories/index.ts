import carRepository, { type CarRepository } from './car.repository';
import pageRepository, { type PageRepository } from './page.repository';

export interface Repositories {
  cars: CarRepository;
  pages: PageRepository;
}

export default {
  cars: carRepository,
  pages: pageRepository,
};