import { QuotaEnforcementService } from "./quota-enforcement.service";
import { HandleUploadRequestCmd, IQuotaEnforcementService } from "../../port/inbound";
import { StubbedInstance, stubInterface } from "ts-sinon";
import { IDatabaseUtil, ILockUtil, IQueueUtil } from "../../port/outbound/utils";
import {
  IQuotaOfferRepository,
  IQuotaRepository,
  IQuotaTransactionRepository,
  IUploadRequestRepository,
} from "../../port/outbound/repository";
import { UploadRequestStatus } from "../model";

describe("QuotaEnforcementService", () => {
  let quotaEnforcementService: IQuotaEnforcementService;
  let lockUtil: StubbedInstance<ILockUtil>;
  let queueUtil: StubbedInstance<IQueueUtil>;
  let databaseUtil: StubbedInstance<IDatabaseUtil>;
  let quotaRepository: StubbedInstance<IQuotaRepository>;
  let quotaOfferRepository: StubbedInstance<IQuotaOfferRepository>;
  let quotaTransactionRepository: StubbedInstance<IQuotaTransactionRepository>;
  let uploadRequestRepository: StubbedInstance<IUploadRequestRepository>;

  beforeEach(() => {
    lockUtil = stubInterface();
    queueUtil = stubInterface();
    databaseUtil = stubInterface();
    quotaRepository = stubInterface();
    quotaOfferRepository = stubInterface();
    quotaTransactionRepository = stubInterface();
    uploadRequestRepository = stubInterface();

    quotaEnforcementService = new QuotaEnforcementService(
      lockUtil,
      queueUtil,
      databaseUtil,
      quotaRepository,
      quotaOfferRepository,
      quotaTransactionRepository,
      uploadRequestRepository,
    );
  });

  describe("#handleUploadRequest", () => {
    let cmd: HandleUploadRequestCmd;

    beforeEach(() => {
      cmd = { uploadId: "UPLOAD_ID", totalSize: 100, owner: "OWNER" };

      lockUtil.acquireLock.callsFake(async (_, cb) => cb());
      databaseUtil.startTransaction.callsFake(async (cb) => cb());
      uploadRequestRepository.findById.resolves({
        uploadId: "UPLOAD_ID",
        owner: "OWNER",
        status: UploadRequestStatus.NEW,
        size: 100,
      });
      quotaRepository.findByOwner.resolves({ owner: "OWNER", id: 1, limit: 1000, currentUsage: 0, offerId: 2 });
      quotaOfferRepository.findActiveOffer.resolves({ is_active: true, id: 2, limit: 1000, description: "Offer" });
    });

    describe("Given the upload ID already existed with status = NEW", () => {
      beforeEach(async () => {
        // Arrange
        uploadRequestRepository.findById.resolves({
          uploadId: "EXISTED_UPLOAD_ID",
          owner: "OWNER",
          status: UploadRequestStatus.NEW,
          size: 100,
        });
        // Act
        await quotaEnforcementService.handleUploadRequest(cmd);
      });

      it("should not insert new upload request", async () => {
        expect(uploadRequestRepository.insert.notCalled).toBeTruthy();
      });

      it("should update the existed upload request", async () => {
        expect(uploadRequestRepository.update.args).toMatchObject([[{ uploadId: "EXISTED_UPLOAD_ID" }]]);
      });

      it("should publish message with existed upload request", async () => {
        expect(queueUtil.publish.args).toMatchObject([["quota_enforcement_result", { uploadId: "EXISTED_UPLOAD_ID" }]]);
      });
    });

    Object.values(UploadRequestStatus)
      .filter((status) => status != UploadRequestStatus.NEW)
      .forEach((status) => {
        describe(`Given the upload ID already existed with status = ${status}`, () => {
          beforeEach(async () => {
            // Arrange
            uploadRequestRepository.findById.resolves({
              uploadId: "EXISTED_UPLOAD_ID",
              owner: "OWNER",
              status,
              size: 100,
            });
            // Act
            await quotaEnforcementService.handleUploadRequest(cmd);
          });

          it("should not insert new upload request", async () => {
            expect(uploadRequestRepository.insert.notCalled).toBeTruthy();
          });

          it("should not update upload request", async () => {
            expect(uploadRequestRepository.update.notCalled).toBeTruthy();
          });

          it("should not publish message", async () => {
            expect(queueUtil.publish.notCalled).toBeTruthy();
          });
        });
      });

    describe("Given the upload ID not existed", () => {
      beforeEach(async () => {
        // Arrange
        uploadRequestRepository.findById.resolves(null);
        uploadRequestRepository.insert.resolves({
          uploadId: "NEW_UPLOAD_ID",
          owner: "OWNER",
          status: UploadRequestStatus.NEW,
          size: 100,
        });
        cmd.uploadId = "NEW_UPLOAD_ID";
        // Act
        await quotaEnforcementService.handleUploadRequest(cmd);
      });

      it("should insert new upload request", async () => {
        expect(uploadRequestRepository.insert.args).toEqual([
          [{ owner: "OWNER", size: 100, status: "NEW", uploadId: "NEW_UPLOAD_ID" }],
        ]);
      });

      it("should update the new upload request", async () => {
        expect(uploadRequestRepository.update.args).toMatchObject([[{ uploadId: "NEW_UPLOAD_ID" }]]);
      });

      it("should publish message with new upload request", async () => {
        expect(queueUtil.publish.args).toMatchObject([["quota_enforcement_result", { uploadId: "NEW_UPLOAD_ID" }]]);
      });
    });

    describe("Given the quota is already existed", () => {
      beforeEach(async () => {
        // Arrange
        quotaRepository.findByOwner.resolves({ owner: "OWNER", id: 1111, limit: 1000, offerId: 2, currentUsage: 100 });
        // Act
        await quotaEnforcementService.handleUploadRequest(cmd);
      });

      it("should not create new quota by owner", async () => {
        expect(quotaRepository.insert.notCalled).toBeTruthy();
      });

      it("should update existing quota", async () => {
        expect(quotaRepository.update.args).toMatchObject([[{ id: 1111 }]]);
      });

      it("should create transaction based on existing quota", async () => {
        expect(quotaTransactionRepository.insert.args).toMatchObject([[{ quotaId: 1111 }]]);
      });
    });

    describe("Given the quota is not existed", () => {
      beforeEach(async () => {
        // Arrange
        quotaRepository.findByOwner.resolves(null);
        quotaRepository.insert.resolves({ owner: "OWNER", id: 2222, limit: 1000, offerId: 2, currentUsage: 0 });
        // Act
        await quotaEnforcementService.handleUploadRequest(cmd);
      });

      it("should create new quota by owner", async () => {
        expect(quotaRepository.insert.args).toEqual([[{ owner: "OWNER", limit: 1000, offerId: 2, currentUsage: 0 }]]);
      });

      it("should create transaction based on new quota", async () => {
        expect(quotaTransactionRepository.insert.args).toMatchObject([[{ quotaId: 2222 }]]);
      });

      it("should update new quota", async () => {
        expect(quotaRepository.update.args).toMatchObject([[{ id: 2222 }]]);
      });
    });

    describe("Given the active offer is not existed", () => {
      beforeEach(async () => {
        // Arrange
        quotaOfferRepository.findActiveOffer.resolves(null);
      });

      it("should throw error if quota not existed", async () => {
        // Arrange
        quotaRepository.findByOwner.resolves(null);
        // Act
        const promise = quotaEnforcementService.handleUploadRequest(cmd);
        // Assert
        await expect(promise).rejects.toThrow("No active quota offer");
      });
    });

    describe("Given the upload size exceeded quota limit", () => {
      beforeEach(async () => {
        // Arrange
        cmd.totalSize = 981;
        quotaRepository.findByOwner.resolves({ owner: "OWNER", id: 1, limit: 1000, currentUsage: 20, offerId: 1 });
        // Act
        await quotaEnforcementService.handleUploadRequest(cmd);
      });

      it('should update upload request with status = "FAILED"', async () => {
        expect(uploadRequestRepository.update.args).toMatchObject([[{ status: "FAILED" }]]);
      });

      it('should publish message with status = "FAILED"', async () => {
        expect(queueUtil.publish.args).toEqual([
          ["quota_enforcement_result", { failedReason: "quota_exceeded", status: "FAILED", uploadId: "UPLOAD_ID" }],
        ]);
      });
    });

    describe("Given the upload size not exceeded quota limit", () => {
      beforeEach(async () => {
        // Arrange
        cmd.totalSize = 980;
        quotaRepository.findByOwner.resolves({ owner: "OWNER", id: 1, limit: 1000, currentUsage: 20, offerId: 1 });
        // Act
        await quotaEnforcementService.handleUploadRequest(cmd);
      });

      it('should update upload request with status = "SUCCESS"', async () => {
        expect(uploadRequestRepository.update.args).toMatchObject([[{ status: "SUCCESS" }]]);
      });

      it("should update quota usage", async () => {
        expect(quotaRepository.update.args).toMatchObject([[{ currentUsage: 1000 }]]);
      });

      it("should insert a quota transaction", async () => {
        expect(quotaTransactionRepository.insert.args).toEqual([
          [{ action: "INC", currentUsage: 1000, owner: "OWNER", quotaId: 1, size: 980, uploadId: "UPLOAD_ID" }],
        ]);
      });

      it('should publish message with status = "SUCCESS"', async () => {
        expect(queueUtil.publish.args).toEqual([
          ["quota_enforcement_result", { status: "SUCCESS", uploadId: "UPLOAD_ID" }],
        ]);
      });
    });
  });
});
