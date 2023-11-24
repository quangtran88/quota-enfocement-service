import { QuotaOffer } from "../../../core/model";

export const QUOTA_OFFER_REPOSITORY = Symbol("QUOTA_OFFER_REPOSITORY");

export interface IQuotaOfferRepository {
  findActiveOffer(): Promise<QuotaOffer | null>;
}
