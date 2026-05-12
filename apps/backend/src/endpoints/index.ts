import domain from '../domain/services';
import { createCarEndpoint } from './car';
import { createAuthEndpoint } from './auth';
import { createTariffEndpoint } from './tariff';

export default {
  cars: createCarEndpoint(domain),
  auth: createAuthEndpoint(domain),
  tariffs: createTariffEndpoint(domain),
};
