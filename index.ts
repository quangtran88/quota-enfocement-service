import { appContainer } from "./inversify.config";
import { setupSQSConsumer } from "./src/adapter/inbound/sqs-handler";

setupSQSConsumer(appContainer);
