import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

export enum QuotaTransactionAction {
  INCREASE = "INC",
  DECREASE = "DEC",
}

@Entity()
@Index(["owner"])
export class QuotaTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  owner: string;

  @Column()
  quotaId: number;

  @Column({ enum: QuotaTransactionAction })
  action: QuotaTransactionAction;

  @Column()
  uploadId: string;

  @Column()
  size: number;

  @Column()
  currentUsage: number;

  @CreateDateColumn()
  createdAt: Date;

  constructor(
    owner: string,
    quotaId: number,
    action: QuotaTransactionAction,
    uploadId: string,
    size: number,
    currentUsage: number,
  ) {
    this.owner = owner;
    this.quotaId = quotaId;
    this.action = action;
    this.uploadId = uploadId;
    this.size = size;
    this.currentUsage = currentUsage;
  }
}
