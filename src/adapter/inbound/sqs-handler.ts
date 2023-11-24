import { Container } from "inversify";
import { Consumer } from "sqs-consumer";
import { UploadRequestPayloadSchema } from "./validation";
import { IQuotaEnforcementService, QUOTA_ENFORCEMENT_SERVICE } from "../../port/inbound";

export function setupSQSConsumer(container: Container) {
  const quotaEnforcementService = container.get<IQuotaEnforcementService>(QUOTA_ENFORCEMENT_SERVICE);

  const consumer = Consumer.create({
    queueUrl: "http://localhost:4566/000000000000/upload-request",
    region: "ap-southeast-1",
    handleMessage: async (message) => {
      if (message.Body) {
        const body = JSON.parse(message.Body);
        const dto = UploadRequestPayloadSchema.parse(body);
        await quotaEnforcementService.handleUploadRequest(dto);
      }
    },
  });

  consumer.on("error", (err) => {
    console.error(err.message);
  });

  consumer.on("processing_error", (err) => {
    console.error(err.message);
  });

  consumer.start();
}
