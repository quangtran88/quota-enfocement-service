import { DataSource } from "typeorm";
import { Quota, QuotaOffer, QuotaTransaction, UploadRequest } from "../../../core/model";

const AppDataSource = new DataSource({
  type: "sqlite",
  database: "db.sqlite3",
  entities: [QuotaOffer, Quota, QuotaTransaction, UploadRequest],
  synchronize: true,
  logging: false,
});

AppDataSource.initialize()
  .then(() => console.log("Database initialize successfully"))
  .catch((error) => console.log(error));

export { AppDataSource };
