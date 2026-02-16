import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Crew } from './crew.entity';

@Entity('daily_logs')
export class DailyLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'date' })
    date: string;

    @ManyToOne(() => Crew, { eager: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'crew_id' })
    crew: Crew;

    @Column({ name: 'crew_id', nullable: true })
    crewId: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    hoursWorked: number;

    @Column({ type: 'int', default: 0 })
    jobsCompleted: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    revenuePerJob: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalRevenue: number;

    // Snapshots of Crew data at the time of log creation
    @Column({ name: 'snapshot_zone_id', nullable: true })
    snapshotZoneId: string;

    @Column({ name: 'snapshot_role', nullable: true })
    snapshotRole: string;

    @Column({ name: 'snapshot_status', nullable: true })
    snapshotStatus: string;

    @Column({ name: 'snapshot_scheduled_hours', type: 'decimal', precision: 5, scale: 2, default: 0 })
    snapshotScheduledHours: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
