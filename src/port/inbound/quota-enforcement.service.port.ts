export const QUOTA_ENFORCEMENT_SERVICE = Symbol("QUOTA_ENFORCEMENT_SERVICE");

export interface IQuotaEnforcementService {
  handleUploadRequest(cmd: HandleUploadRequestCmd): Promise<void>;
}

export type HandleUploadRequestCmd = {
  uploadId: string;
  owner: string;
  totalSize: number;
};
