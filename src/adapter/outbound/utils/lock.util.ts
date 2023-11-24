import { ILockUtil } from "../../../port/outbound/utils";
import { injectable } from "inversify";

@injectable()
export class LockUtil implements ILockUtil {
  async acquireLock(key: string, execution: () => Promise<void>): Promise<void> {
    console.log(`Lock ${key} acquired`);
    try {
      await execution();
    } finally {
      console.log(`Lock ${key} released`);
    }
  }
}
