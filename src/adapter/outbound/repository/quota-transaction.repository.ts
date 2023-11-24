import { IQuotaTransactionRepository } from "../../../port/outbound";
import { QuotaTransaction } from "../../../core/model";
import { inject, injectable } from "inversify";
import { DataSource, Repository } from "typeorm";

@injectable()
export class QuotaTransactionRepository implements IQuotaTransactionRepository {
  private repo: Repository<QuotaTransaction>;

  constructor(@inject(DataSource) dataSource: DataSource) {
    this.repo = dataSource.getRepository(QuotaTransaction);
  }

  insert(user: Omit<QuotaTransaction, "id">): Promise<QuotaTransaction> {
    return this.repo.save(user);
  }
}
