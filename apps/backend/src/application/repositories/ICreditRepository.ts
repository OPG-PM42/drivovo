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

export interface ICreditRepository {
  findById(id: string): Promise<CreditEntity | null>;
  findAll(): Promise<CreditEntity[]>;
  findByUserId(userId: string): Promise<CreditEntity[]>;
  create(data: CreateCreditDto): Promise<CreditEntity>;
  update(id: string, data: UpdateCreditDto): Promise<CreditEntity | null>;
  delete(id: string): Promise<void>;
}
