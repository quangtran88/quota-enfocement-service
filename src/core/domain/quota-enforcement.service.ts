import { HandleUploadRequestCmd, IQuotaEnforcementService } from "../../port/inbound";
import { inject, injectable } from "inversify";
import { DATABASE_UTIL, IDatabaseUtil, ILockUtil, IQueueUtil, LOCK_UTIL, QUEUE_UTIL } from "../../port/outbound/utils";
import {
  IQuotaOfferRepository,
  IQuotaRepository,
  IQuotaTransactionRepository,
  IUploadRequestRepository,
  QUOTA_OFFER_REPOSITORY,
  QUOTA_REPOSITORY,
  QUOTA_TRANSACTION_REPOSITORY,
  UPLOAD_REQUEST_REPOSITORY,
} from "../../port/outbound/repository";
import { Quota, QuotaTransaction, QuotaTransactionAction, UploadRequest, UploadRequestStatus } from "../model";

const QUOTA_ENFORCEMENT_RESULT_QUEUE = "quota_enforcement_result";

type QuotaEnforcementResult = {
  uploadId: string;
  status: "SUCCESS" | "FAILED";
  failedReason?: string;
};

@injectable()
export class QuotaEnforcementService implements IQuotaEnforcementService {
  constructor(
    @inject(LOCK_UTIL) private lockUtil: ILockUtil,
    @inject(QUEUE_UTIL) private queueUtil: IQueueUtil,
    @inject(DATABASE_UTIL) private databaseUtil: IDatabaseUtil,
    @inject(QUOTA_REPOSITORY) private quotaRepository: IQuotaRepository,
    @inject(QUOTA_OFFER_REPOSITORY) private quotaOfferRepository: IQuotaOfferRepository,
    @inject(QUOTA_TRANSACTION_REPOSITORY) private quotaTransactionRepository: IQuotaTransactionRepository,
    @inject(UPLOAD_REQUEST_REPOSITORY) private uploadRequestRepository: IUploadRequestRepository,
  ) {}

  async handleUploadRequest(cmd: HandleUploadRequestCmd): Promise<void> {
    const { uploadId, totalSize, owner } = cmd;

    const lockKey = `HANDLE_UPLOAD_REQUEST_${uploadId}`;
    await this.lockUtil.acquireLock(lockKey, async () => {
      const uploadRequest = await this.getOrCreateUpdateRequest(uploadId, totalSize, owner);
      if (uploadRequest.status !== UploadRequestStatus.NEW) {
        return;
      }

      const quota = await this.getOrCreateQuota(owner);
      if (this.isQuotaExceeded(quota, totalSize)) {
        await this.handleFailedUploadRequest(uploadRequest, "quota_exceeded");
        return;
      }

      await this.handleSuccessUploadRequest(quota, uploadRequest, totalSize);
    });
  }

  private async getOrCreateUpdateRequest(uploadId: string, totalSize: number, owner: string): Promise<UploadRequest> {
    const existedUploadRequest = await this.uploadRequestRepository.findById(uploadId);
    if (existedUploadRequest) return existedUploadRequest;

    const uploadRequest = new UploadRequest(uploadId, owner, totalSize);
    return await this.uploadRequestRepository.insert(uploadRequest);
  }

  private async getOrCreateQuota(owner: string): Promise<Quota> {
    const existedQuota = await this.quotaRepository.findByOwner(owner);
    if (existedQuota) return existedQuota;

    const offer = await this.quotaOfferRepository.findActiveOffer();
    if (!offer) {
      throw new Error("No active quota offer");
    }

    const quota = new Quota(owner, offer.id, offer.limit);
    return await this.quotaRepository.insert(quota);
  }

  private async handleFailedUploadRequest(uploadRequest: UploadRequest, reason: string) {
    await this.databaseUtil.startTransaction(async () => {
      uploadRequest.status = UploadRequestStatus.FAILED;
      await this.uploadRequestRepository.update(uploadRequest);

      await this.queueUtil.publish<QuotaEnforcementResult>(QUOTA_ENFORCEMENT_RESULT_QUEUE, {
        uploadId: uploadRequest.uploadId,
        status: "FAILED",
        failedReason: reason,
      });
    });
  }

  private async handleSuccessUploadRequest(quota: Quota, uploadRequest: UploadRequest, totalSize: number) {
    await this.databaseUtil.startTransaction(async () => {
      quota.currentUsage += totalSize;
      await this.quotaRepository.update(quota);

      uploadRequest.status = UploadRequestStatus.SUCCESS;
      await this.uploadRequestRepository.update(uploadRequest);

      const quotaTransaction = new QuotaTransaction(
        uploadRequest.owner,
        quota.id,
        QuotaTransactionAction.INCREASE,
        uploadRequest.uploadId,
        totalSize,
        quota.currentUsage,
      );
      await this.quotaTransactionRepository.insert(quotaTransaction);

      await this.queueUtil.publish<QuotaEnforcementResult>(QUOTA_ENFORCEMENT_RESULT_QUEUE, {
        uploadId: uploadRequest.uploadId,
        status: "SUCCESS",
      });
    });
  }

  private isQuotaExceeded(quota: Quota, totalSize: number): boolean {
    return quota.currentUsage + totalSize > quota.limit;
  }
}
