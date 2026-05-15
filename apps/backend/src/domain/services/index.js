import repositories from '../../repositories';
import createCarService from './car';
import createAdminService from './admin';
import createSessionService from './session';

const deps = { repositories };

export default {
  cars: createCarService(deps),
  admins: createAdminService(deps),
  sessions: createSessionService(deps),
};
