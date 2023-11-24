import { IQuotaEnforcementService, VerifyUploadRequestCmd } from "../../port/inbound";
import { injectable } from "inversify";

@injectable()
export class QuotaEnforcementService implements IQuotaEnforcementService {
  async verifyUploadRequest(cmd: VerifyUploadRequestCmd): Promise<void> {
    return;
  }
}
