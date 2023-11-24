import { UploadRequest } from "../../core/model";

export const UPLOAD_REQUEST_REPOSITORY = Symbol("UPLOAD_REQUEST_REPOSITORY");

export interface IUploadRequestRepository {
  findById(id: string): Promise<UploadRequest | null>;
  insert(user: Omit<UploadRequest, "id">): Promise<UploadRequest>;
  update(user: UploadRequest): Promise<UploadRequest>;
}
