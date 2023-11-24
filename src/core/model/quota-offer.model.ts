import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class QuotaOffer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  limit: number;

  @Column()
  is_active: boolean;

  @Column()
  description: string;
}

