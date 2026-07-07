import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Crew } from './crew.entity';

@Entity('buildings')
export class Building {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // E.g., "B1 - North Zone"

  @Column()
  type: string; // E.g., "2 BHK", "3 BHK"

  @Column({ default: 'Active' })
  status: string;

  @Column({ name: 'building_number' })
  buildingNumber: string;

  @Column()
  zone: string; // Zone name string (e.g. "North Zone")

  @Column({ name: 'apartment_number' })
  apartmentNumber: string;

  @Column({ name: 'tenant_name' })
  tenantName: string;

  @Column({ name: 'contact_number' })
  contactNumber: string;

  @Column({ name: 'email_address' })
  emailAddress: string;

  @Column({ name: 'has_car', default: false })
  hasCar: boolean;

  @Column({ type: 'jsonb', default: [] })
  cars: { carNumber: string; modelType: string }[];

  @OneToMany(() => Crew, (crew) => crew.building)
  crews: Crew[];
}
