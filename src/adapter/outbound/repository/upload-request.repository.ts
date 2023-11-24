import { IUploadRequestRepository } from "../../../port/outbound/repository";
import { UploadRequest } from "../../../core/model";
import { inject, injectable } from "inversify";
import { DataSource, Repository } from "typeorm";

@injectable()
export class UploadRequestRepository implements IUploadRequestRepository {
  private repo: Repository<UploadRequest>;

  constructor(@inject(DataSource) dataSource: DataSource) {
    this.repo = dataSource.getRepository(UploadRequest);
  }

  insert(model: Omit<UploadRequest, "id">): Promise<UploadRequest> {
    const entity = this.repo.create(model);
    return this.repo.save(entity);
  }

  findById(id: string): Promise<UploadRequest | null> {
    return this.repo.findOneBy({ uploadId: id });
  }

  update(model: UploadRequest): Promise<UploadRequest> {
    return this.repo.save(model);
  }
}
