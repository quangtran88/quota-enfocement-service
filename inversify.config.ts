import "reflect-metadata";
import { Container } from "inversify";
import {
  IQuotaOfferRepository,
  IQuotaRepository,
  IQuotaTransactionRepository,
  IUploadRequestRepository,
  QUOTA_OFFER_REPOSITORY,
  QUOTA_REPOSITORY,
  QUOTA_TRANSACTION_REPOSITORY,
  UPLOAD_REQUEST_REPOSITORY,
} from "./src/port/outbound/repository";
import {
  QuotaOfferRepository,
  QuotaRepository,
  QuotaTransactionRepository,
  UploadRequestRepository,
} from "./src/adapter/outbound/repository";
import { DataSource } from "typeorm";
import { AppDataSource } from "./src/adapter/outbound/typeorm/datasource";
import { IQuotaEnforcementService, QUOTA_ENFORCEMENT_SERVICE } from "./src/port/inbound";
import { QuotaEnforcementService } from "./src/core/domain/quota-enforcement.service";
import { QUEUE_UTIL, IQueueUtil, ILockUtil, LOCK_UTIL, IDatabaseUtil, DATABASE_UTIL } from "./src/port/outbound/utils";
import { LockUtil } from "./src/adapter/outbound/utils/lock.util";
import { QueueUtil } from "./src/adapter/outbound/utils/queue.util";
import { DatabaseUtil } from "./src/adapter/outbound/utils/database.util";

const appContainer = new Container();

appContainer.bind(DataSource).toConstantValue(AppDataSource);

appContainer.bind<IQuotaRepository>(QUOTA_REPOSITORY).to(QuotaRepository);
appContainer.bind<IQuotaOfferRepository>(QUOTA_OFFER_REPOSITORY).to(QuotaOfferRepository);
appContainer.bind<IQuotaTransactionRepository>(QUOTA_TRANSACTION_REPOSITORY).to(QuotaTransactionRepository);
appContainer.bind<IUploadRequestRepository>(UPLOAD_REQUEST_REPOSITORY).to(UploadRequestRepository);

appContainer.bind<ILockUtil>(LOCK_UTIL).to(LockUtil);
appContainer.bind<IQueueUtil>(QUEUE_UTIL).to(QueueUtil);
appContainer.bind<IDatabaseUtil>(DATABASE_UTIL).to(DatabaseUtil);

appContainer.bind<IQuotaEnforcementService>(QUOTA_ENFORCEMENT_SERVICE).to(QuotaEnforcementService);

export { appContainer };
