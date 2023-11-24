import { IQuotaRepository } from "../../../port/outbound";
import { Quota } from "../../../core/model";
import { inject, injectable } from "inversify";
import { DataSource, FindOptionsWhere, Not, Repository } from "typeorm";

@injectable()
export class QuotaRepository implements IQuotaRepository {
  private repo: Repository<Quota>;

  constructor(@inject(DataSource) dataSource: DataSource) {
    this.repo = dataSource.getRepository(Quota);
  }

  findAll(): Promise<Quota[]> {
    return this.repo.find();
  }

  insert(user: Omit<Quota, "id">): Promise<Quota> {
    return this.repo.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete({ id });
  }

  findById(id: number): Promise<Quota | null> {
    return this.repo.findOneBy({ id });
  }

  update(user: Quota): Promise<Quota> {
    return this.repo.save(user);
  }
}
