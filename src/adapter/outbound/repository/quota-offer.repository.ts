import { IQuotaOfferRepository } from "../../../port/outbound";
import { QuotaOffer } from "../../../core/model";
import { inject, injectable } from "inversify";
import { DataSource, Repository } from "typeorm";

@injectable()
export class QuotaOfferRepository implements IQuotaOfferRepository {
  private repo: Repository<QuotaOffer>;

  constructor(@inject(DataSource) dataSource: DataSource) {
    this.repo = dataSource.getRepository(QuotaOffer);
  }

  findActiveOffer(): Promise<QuotaOffer | null> {
    return this.repo.findOneBy({ is_active: true });
  }
}
