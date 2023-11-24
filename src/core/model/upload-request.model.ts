import { Column, Entity, PrimaryColumn } from "typeorm";

export enum UploadRequestStatus {
  NEW = "NEW",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

@Entity()
export class UploadRequest {
  @PrimaryColumn()
  uploadId: string;

  @Column()
  owner: string;

  @Column({ enum: UploadRequestStatus })
  status: UploadRequestStatus;

  @Column()
  size: number;
}
