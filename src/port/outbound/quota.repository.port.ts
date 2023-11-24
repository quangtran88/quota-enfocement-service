import { Quota } from "../../core/model";

export const QUOTA_REPOSITORY = Symbol("QUOTA_REPOSITORY");

export interface IQuotaRepository {
  findByOwner(owner: string): Promise<Quota | null>;
  insert(user: Omit<Quota, "id">): Promise<Quota>;
  update(user: Quota): Promise<Quota>;
}
