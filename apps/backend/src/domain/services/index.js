import repositories from '../../repositories';
import { createCarService } from './car';
import createAdminService from './admin';
import createSessionService from './session';
import createUserService from './user';

const deps = { repositories };

export default {
  cars: createCarService(deps),
  admins: createAdminService(deps),
  sessions: createSessionService(deps),
  users: createUserService(deps),
};
