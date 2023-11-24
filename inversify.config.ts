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
} from "./src/port/outbound";
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

const appContainer = new Container();

appContainer.bind(DataSource).toConstantValue(AppDataSource);

appContainer.bind<IQuotaRepository>(QUOTA_REPOSITORY).to(QuotaRepository);
appContainer.bind<IQuotaOfferRepository>(QUOTA_OFFER_REPOSITORY).to(QuotaOfferRepository);
appContainer.bind<IQuotaTransactionRepository>(QUOTA_TRANSACTION_REPOSITORY).to(QuotaTransactionRepository);
appContainer.bind<IUploadRequestRepository>(UPLOAD_REQUEST_REPOSITORY).to(UploadRequestRepository);

appContainer.bind<IQuotaEnforcementService>(QUOTA_ENFORCEMENT_SERVICE).to(QuotaEnforcementService);

export { appContainer };
