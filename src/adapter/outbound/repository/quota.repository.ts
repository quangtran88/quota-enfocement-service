import { IQuotaRepository } from "../../../port/outbound/repository";
import { Quota } from "../../../core/model";
import { inject, injectable } from "inversify";
import { DataSource, Repository } from "typeorm";

@injectable()
export class QuotaRepository implements IQuotaRepository {
  private repo: Repository<Quota>;

  constructor(@inject(DataSource) dataSource: DataSource) {
    this.repo = dataSource.getRepository(Quota);
  }

  findByOwner(owner: string): Promise<Quota | null> {
    return this.repo.findOneBy({ owner });
  }

  insert(model: Omit<Quota, "id">): Promise<Quota> {
    return this.repo.save(model);
  }

  update(model: Quota): Promise<Quota> {
    return this.repo.save(model);
  }
}
