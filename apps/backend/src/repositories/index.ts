import adminRepository, { type AdminRepository } from './admin.repository';
import carRepository, { type CarRepository } from './car.repository';
import pageRepository, { type PageRepository } from './page.repository';
import sessionRepository, { type SessionRepository } from './session.repository';

export interface Repositories {
  admins: AdminRepository;
  cars: CarRepository;
  pages: PageRepository;
  sessions: SessionRepository;
}

export default {
  admins: adminRepository,
  cars: carRepository,
  pages: pageRepository,
  sessions: sessionRepository,
} satisfies Repositories;
