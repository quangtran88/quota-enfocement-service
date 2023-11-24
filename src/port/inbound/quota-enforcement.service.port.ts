export const QUOTA_ENFORCEMENT_SERVICE = Symbol("QUOTA_ENFORCEMENT_SERVICE");

export interface IQuotaEnforcementService {
  verifyUploadRequest(cmd: VerifyUploadRequestCmd): Promise<void>;
}

export type VerifyUploadRequestCmd = {
  uploadId: string;
  owner: string;
  totalSize: number;
};
