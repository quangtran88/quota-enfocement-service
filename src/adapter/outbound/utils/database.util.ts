import { IDatabaseUtil } from "../../../port/outbound/utils";
import { injectable } from "inversify";

@injectable()
export class DatabaseUtil implements IDatabaseUtil {
  async startTransaction(execution: () => Promise<void>): Promise<void> {
    console.log("Transaction begin");
    try {
      await execution();
      console.log("Transaction committed");
    } catch (e) {
      console.log("Transaction rollback");
    }
  }
}
