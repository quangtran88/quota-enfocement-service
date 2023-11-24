import { QuotaTransaction } from "../../core/model";

export const QUOTA_TRANSACTION_REPOSITORY = Symbol("QUOTA_TRANSACTION_REPOSITORY");

export interface IQuotaTransactionRepository {
  insert(user: Omit<QuotaTransaction, "id">): Promise<QuotaTransaction>;
}
