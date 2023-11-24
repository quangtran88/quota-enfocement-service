import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

export enum QuotaTransactionAction {
  INCREASE = "INC",
  DECREASE = "DEC"
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
  uploadId: number;

  @Column()
  size: number;

  @Column()
  currentUsage: number;
  
  @CreateDateColumn()
  createdAt: Date;
}

