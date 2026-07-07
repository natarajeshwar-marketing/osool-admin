import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Building } from './building.entity';

@Entity()
export class Crew {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  dateOfJoining: string;

  @ManyToOne(() => Building, (building) => building.crews, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'building_id' })
  building: Building | null;

  @Column({ name: 'building_id', nullable: true })
  buildingId: string;

  @Column()
  role: string; // Technician, Cleaner

  @Column({ default: 'Active' })
  status: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  scheduledHours: number;

  revenue: number;
}
