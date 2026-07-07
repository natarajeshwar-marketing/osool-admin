import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EnquiryStatus {
  PENDING = 'Pending',
  CONVERTED = 'Converted',
}

export enum EnquirySource {
  WEBSITE = 'Website',
  PHONE = 'Phone',
  EMAIL = 'Email',
  WALK_IN = 'Walk-in',
}

@Entity('enquiries')
export class Enquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_name' })
  clientName: string;

  @Column({ name: 'client_email' })
  clientEmail: string;

  @Column({ name: 'client_phone' })
  clientPhone: string;

  @Column({ name: 'service_name' })
  serviceName: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'building_number', nullable: true })
  buildingNumber: string;

  @Column({ name: 'apartment_number', nullable: true })
  apartmentNumber: string;

  @Column({ name: 'apartment_type', nullable: true })
  apartmentType: string;

  @Column({
    type: 'enum',
    enum: EnquiryStatus,
    default: EnquiryStatus.PENDING,
  })
  status: EnquiryStatus;

  @Column({
    type: 'enum',
    enum: EnquirySource,
    default: EnquirySource.WEBSITE,
  })
  source: EnquirySource;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
