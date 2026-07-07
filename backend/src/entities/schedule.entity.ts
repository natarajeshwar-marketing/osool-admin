import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { Building } from './building.entity';
import { Crew } from './crew.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'building_number', nullable: true })
  buildingNumber: string;

  @Column({ nullable: true })
  zone: string;

  @Column({ name: 'apartment_number', nullable: true })
  apartmentNumber: string;

  @Column({ name: 'tenant_name', nullable: true })
  tenantName: string;

  @Column({ name: 'apartment_type', nullable: true })
  apartmentType: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ name: 'email_address', nullable: true })
  emailAddress: string;

  @Column({ type: 'int' })
  date: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'int' })
  year: number;

  @Column()
  frequency: string;

  @Column({ type: 'jsonb', nullable: true, name: 'repeat_days' })
  repeatDays: string[];

  @Column({ name: 'start_time' })
  startTime: string;

  @Column({ name: 'end_time' })
  endTime: string;

  @Column({ name: 'service_name' })
  serviceName: string;

  @Column({ name: 'service_category', nullable: true })
  serviceCategory: string;

  @ManyToOne(() => Building, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'building_id' })
  building: Building | null;

  @Column({ name: 'building_id', nullable: true })
  buildingId: string | null;

  @ManyToMany(() => Crew, { cascade: true })
  @JoinTable({
    name: 'schedule_crews',
    joinColumn: { name: 'schedule_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'crew_id', referencedColumnName: 'id' },
  })
  crews: Crew[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value) || 0,
    },
  })
  discount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    name: 'base_cost',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value) || 0,
    },
  })
  baseCost: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value) || 0,
    },
  })
  vat: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    name: 'total_cost',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value) || 0,
    },
  })
  totalCost: number;

  @Column({ type: 'boolean', default: false, name: 'confirmed_booking' })
  confirmedBooking: boolean;

  @Column({ name: 'payment_method', default: 'cash' })
  paymentMethod: string;
}
