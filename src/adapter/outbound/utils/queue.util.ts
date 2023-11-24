import { IQueueUtil } from "../../../port/outbound/utils";
import { injectable } from "inversify";

@injectable()
export class QueueUtil implements IQueueUtil {
  async publish(queueName: string, message: any): Promise<void> {
    console.log(`Published message ${JSON.stringify(message)} to queue ${queueName}`);
  }
}
