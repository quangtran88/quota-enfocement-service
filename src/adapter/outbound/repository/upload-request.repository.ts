import { IUploadRequestRepository } from "../../../port/outbound";
import { UploadRequest } from "../../../core/model";
import { inject, injectable } from "inversify";
import { DataSource, Repository } from "typeorm";

@injectable()
export class UploadRequestRepository implements IUploadRequestRepository {
  private repo: Repository<UploadRequest>;

  constructor(@inject(DataSource) dataSource: DataSource) {
    this.repo = dataSource.getRepository(UploadRequest);
  }

  insert(user: Omit<UploadRequest, "id">): Promise<UploadRequest> {
    return this.repo.save(user);
  }

  findById(id: string): Promise<UploadRequest | null> {
    return this.repo.findOneBy({ uploadId: id });
  }

  update(user: UploadRequest): Promise<UploadRequest> {
    return this.repo.save(user);
  }
}
