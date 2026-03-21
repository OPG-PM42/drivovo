import type { CreditEntity } from '../entities';
import type { CRUD, SearchParams } from './crud';

export interface CreditSearchParams extends SearchParams {
  userId?: string;
  status?: CreditEntity['status'];
}

export interface CreditRepository extends CRUD<CreditEntity, CreditSearchParams> {
  findByUserId(userId: string): Promise<CreditEntity[]>;
}
