import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@Index(["owner"])
export class Quota {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  owner: string;

  @Column()
  offerId: number;

  @Column()
  limit: number;

  @Column()
  currentUsage: number;

  constructor(owner: string, offerId: number, limit: number) {
    this.owner = owner;
    this.offerId = offerId;
    this.limit = limit;
    this.currentUsage = 0;
  }
}
