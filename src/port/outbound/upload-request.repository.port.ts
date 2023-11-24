import { Quota } from "../../core/model";

export const QUOTA_REPOSITORY = Symbol("QUOTA_REPOSITORY");

export interface IQuotaRepository {
  findAll(): Promise<Quota[]>;
  findById(id: number): Promise<Quota | null>;
  findByEmail(email: string, excludedId?: number): Promise<Quota | null>;
  insert(user: Omit<Quota, "id">): Promise<Quota>;
  update(user: Quota): Promise<Quota>;
  remove(id: number): Promise<void>;
}
