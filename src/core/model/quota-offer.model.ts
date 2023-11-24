import {Column, Entity, PrimaryColumn} from "typeorm";

export enum UploadRequestStatus {
  NEW="NEW",
  SUCCESS="SUCCESS",
  FAILED="FAILED"
}

@Entity()
export class UploadRequest {
  @PrimaryColumn()
  uploadId: number;
  
  @Column()
  owner: string
  
  @Column({enum: UploadRequestStatus})
  status: UploadRequestStatus
  
  @Column({type: 'bigint'})
  size: number
}

