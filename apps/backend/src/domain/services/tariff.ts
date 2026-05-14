import type { TariffEntity } from '@drivovo/domain';
import { type Dependencies, DOMAIN_ERRORS, DomainError } from './service';
import type { TariffRepository } from '../../repositories/tariff.repository';

type TariffSearchParams = Parameters<TariffRepository['find']>[0];

export interface TariffService {
  getAll(params?: TariffSearchParams): Promise<TariffEntity[]>;
  getById(id: string): Promise<TariffEntity>;
  create(entity: TariffEntity): Promise<string>;
  update(entity: TariffEntity): Promise<string>;
  delete(id: string): Promise<string>;
}

export default ({ repositories: repos }: Dependencies): TariffService => ({
  async getAll(params) {
    return repos.tariffs.find(params ?? {});
  },
  async getById(id) {
    const tariff = await repos.tariffs.findOne(id);
    if (!tariff) throw new DomainError(DOMAIN_ERRORS.NOT_FOUND, `Tariff with id ${id} not found`);
    return tariff;
  },
  async create(entity) {
    const id = await repos.tariffs.insert(entity);
    if (!id) throw new DomainError(DOMAIN_ERRORS.UNKNOWN_ERROR, 'Failed to create tariff');
    return id;
  },
  async update(entity) {
    const id = await repos.tariffs.update(entity);
    if (!id) throw new DomainError(DOMAIN_ERRORS.NOT_FOUND, `Tariff with id ${entity.id} not found`);
    return id;
  },
  async delete(id) {
    const deleted = await repos.tariffs.delete(id);
    if (!deleted) throw new DomainError(DOMAIN_ERRORS.NOT_FOUND, `Tariff with id ${id} not found`);
    return deleted;
  },
});
