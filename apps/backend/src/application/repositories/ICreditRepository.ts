import type { CreditEntity } from 'domain';

export interface CreateCreditDto {
  tariffId: string;
  carId: string;
  countryId: string;
  userId: string;
  status: CreditEntity['status'];
  term: number;
  deposit: CreditEntity['deposit'];
}

export interface UpdateCreditDto {
  status?: CreditEntity['status'];
  term?: number;
  deposit?: CreditEntity['deposit'];
}

export interface CRUD<E extends object> {
  findById(id: string): Promise<E | null>;
  findAll(): Promise<E[]>;
  create(data: E): Promise<E>;
  update(id: string, data: Partial<E>): Promise<E | null>;
  delete(id: string): Promise<void>;
}
export interface CreditRepository extends CRUD<CreditEntity>{
  findByUserId(userId: string): Promise<CreditEntity[]>;
}

