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
}

