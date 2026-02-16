import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { DailyLog } from '../entities/daily-log.entity';
import { Crew } from '../entities/crew.entity';
import { Zone } from '../entities/zone.entity';

@Injectable()
export class DailyLogsService implements OnModuleInit {
    private readonly logger = new Logger(DailyLogsService.name);

    constructor(
        @InjectRepository(DailyLog)
        private dailyLogsRepository: Repository<DailyLog>,
        @InjectRepository(Crew)
        private crewRepository: Repository<Crew>,
        @InjectRepository(Zone)
        private zoneRepository: Repository<Zone>,
    ) { }

    async onModuleInit() {
        await this.backfillSnapshots();
    }

    async getDashboardStats(startDate?: string, endDate?: string) {
        // 1. Total Crews (Current Db State)
        const totalCrew = await this.crewRepository.count();

        // Helper to get working days (if needed for theoretical capacity, but with snapshots we imply logged capacity)
        // Leaving it for partial logic if we mix strategies, but ideally we rely on snapshots.

        // 2 & 5. Aggregated Stats from Daily Logs (using snapshots)
        const statsQuery = this.dailyLogsRepository.createQueryBuilder('daily_log')
            .select('daily_log.snapshotZoneId', 'zoneId')
            .addSelect('COUNT(DISTINCT daily_log.crewId)', 'activeCrews')
            .addSelect('SUM(daily_log.hoursWorked)', 'totalWorked')
            .addSelect('SUM(daily_log.totalRevenue)', 'totalRevenue')
            .addSelect('SUM(daily_log.snapshotScheduledHours)', 'totalScheduled')

            // Role specific worked hours
            .addSelect('SUM(CASE WHEN daily_log.snapshotRole = \'Technician\' THEN daily_log.hoursWorked ELSE 0 END)', 'techWorked')
            .addSelect('SUM(CASE WHEN daily_log.snapshotRole = \'Cleaner\' THEN daily_log.hoursWorked ELSE 0 END)', 'cleanerWorked')

            // Role specific scheduled hours (Capacity)
            .addSelect('SUM(CASE WHEN daily_log.snapshotRole = \'Technician\' THEN daily_log.snapshotScheduledHours ELSE 0 END)', 'techScheduled')
            .addSelect('SUM(CASE WHEN daily_log.snapshotRole = \'Cleaner\' THEN daily_log.snapshotScheduledHours ELSE 0 END)', 'cleanerScheduled')

            // Role counts (Active unique heads per role is harder in one pass, using simplistic sum of logs might be wrong for "Headcount")
            // For "Crew Count" in Zone Allocation, we usually want "Distinct Heads".
            // Let's rely on activeCrews count for headcounts, but splitting by role is complex in single groupby zone.
            // Simplified: "Active Crews" is enough for the card.

            .groupBy('daily_log.snapshotZoneId');

        if (startDate && endDate) {
            statsQuery.where('daily_log.date BETWEEN :startDate AND :endDate', { startDate, endDate });
        } else if (startDate) {
            statsQuery.where('daily_log.date >= :startDate', { startDate });
        }

        const statsResults = await statsQuery.getRawMany();

        // Global Totals from aggregation
        let activeCrews = 0;
        let totalRevenue = 0;
        let globalWorked = 0;
        let globalScheduled = 0;

        const zoneStatsMap = new Map();

        statsResults.forEach(row => {
            const zoneId = row.zoneId || 'unknown';
            const logRevenue = parseFloat(row.totalRevenue) || 0;
            const logWorked = parseFloat(row.totalWorked) || 0;
            const logScheduled = parseFloat(row.totalScheduled) || 0;
            const logActive = parseInt(row.activeCrews) || 0;

            totalRevenue += logRevenue;
            globalWorked += logWorked;
            globalScheduled += logScheduled;
            // activeCrews sum from groups might overlap if crew moved zones? 
            // Querying global distinct active crews directly is safer for the top-level metric.

            zoneStatsMap.set(zoneId, {
                activeCrewCount: logActive, // Heads active in this zone
                workedHours: logWorked,
                totalCapacity: logScheduled,
                revenue: logRevenue,
                techWorked: parseFloat(row.techWorked) || 0,
                cleanerWorked: parseFloat(row.cleanerWorked) || 0,
                techScheduled: parseFloat(row.techScheduled) || 0,
                cleanerScheduled: parseFloat(row.cleanerScheduled) || 0
            });
        });

        // Re-query global active crews to avoid duplicates if a crew worked in multiple zones
        const globalActiveQuery = this.dailyLogsRepository.createQueryBuilder('daily_log')
            .select('COUNT(DISTINCT daily_log.crewId)', 'count');

        if (startDate && endDate) {
            globalActiveQuery.where('daily_log.date BETWEEN :startDate AND :endDate', { startDate, endDate });
        } else if (startDate) {
            globalActiveQuery.where('daily_log.date >= :startDate', { startDate });
        }
        const globalActiveRes = await globalActiveQuery.getRawOne();
        activeCrews = parseInt(globalActiveRes.count, 10) || 0;

        // Utilization
        const utilizationRate = globalScheduled > 0
            ? Math.round((globalWorked / globalScheduled) * 100)
            : 0;

        // 4. Total Zones
        const zones = await this.zoneRepository.find();
        const totalZones = zones.length;

        // 5. Zone Allocation
        const zoneAllocation = zones.map(zone => {
            const stats = zoneStatsMap.get(zone.id) || {
                activeCrewCount: 0,
                workedHours: 0,
                totalCapacity: 0,
                revenue: 0,
                techWorked: 0,
                cleanerWorked: 0,
                techScheduled: 0,
                cleanerScheduled: 0
            };

            const utilization = stats.totalCapacity > 0
                ? Math.round((stats.workedHours / stats.totalCapacity) * 100)
                : 0;

            const technicianUtilization = stats.techScheduled > 0
                ? Math.round((stats.techWorked / stats.techScheduled) * 100)
                : 0;

            const cleanerUtilization = stats.cleanerScheduled > 0
                ? Math.round((stats.cleanerWorked / stats.cleanerScheduled) * 100)
                : 0;

            return {
                zoneName: zone.name,
                zoneId: zone.id,
                activeCrewCount: stats.activeCrewCount,
                // Note: The UI might expect "crewCount", "technicianCount", "cleanerCount" (Current Headcount)
                // vs "activeCrewCount" (Historical). 
                // The previous code returned "crewCount" (Current). 
                // "activeCrewCount" was added later.
                // Keeping "crewCount" as 0 or undefined might break UI?
                // Let's provide 'activeCrewCount' as the main stat.
                // If the UI relies on 'technicianCount' (static), we might want to still fetch it?
                // But the user complained about "shifted data".
                // Let's use the historical "active" counts for the report.
                crewCount: stats.activeCrewCount, // Using active as the count
                workedHours: stats.workedHours,
                totalCapacity: stats.totalCapacity,
                utilizationRate: utilization,
                technicianUtilization,
                cleanerUtilization
            };
        });

        return {
            totalCrew,
            activeCrews,
            utilizationRate,
            totalRevenue,
            totalZones,
            zoneAllocation
        };
    }

    async create(createDailyLogDto: any) {
        const logsToProcess = Array.isArray(createDailyLogDto) ? createDailyLogDto : [createDailyLogDto];
        const results: DailyLog[] = [];

        for (const logDto of logsToProcess) {
            // Fetch crew details for snapshot
            const crew = await this.crewRepository.findOne({ where: { id: logDto.crewId }, relations: ['zone'] });

            const snapshotData = crew ? {
                snapshotZoneId: crew.zone?.id,
                snapshotRole: crew.role,
                snapshotStatus: crew.status,
                snapshotScheduledHours: crew.scheduledHours
            } : {};

            const existingLog = await this.dailyLogsRepository.findOne({
                where: {
                    date: logDto.date,
                    crewId: logDto.crewId
                }
            });

            if (existingLog) {
                // Update existing
                // Note: We might NOT want to update snapshots on edit if the day has passed, 
                // but for simple corrections on the same day, updating snapshots to current crew state is acceptable 
                // OR we preserve original snapshots. 
                // Requirement says "previous all entries log should not be changed... only new log should reflect this changes".
                // So edits to OLD logs should probably preserve snapshots?
                // But typically edits are corrections. 
                // Let's assume creates get snapshots. Updates to specific log fields (hours/revenue) shouldn't change snapshots unless explicitly intended.
                // However, if the log is being "created/updated" via a bulk upload or form that implies "current state", we might want to refresh.
                // Given the requirement "previous all entries... should not be changed", we should probably ONLY set snapshots on creation or if they are missing.

                const updatedData = { ...logDto };
                // If it's an update, we preserve existing snapshots unless they are null (backfill scenario handled elsewhere)
                // If we want to force update snapshots, we'd add them here.
                // For now, let's ONLY add snapshots if they are missing in the existing log (which they initially are) 
                // OR if this is considered a "new" entry logic.
                // Comparing with requirement: "only new log should reflect this changes". 
                // So executed updates to old logs should NOT touch snapshots.

                if (!existingLog.snapshotZoneId && crew) {
                    Object.assign(updatedData, snapshotData);
                }

                const updated = this.dailyLogsRepository.merge(existingLog, updatedData);
                results.push(await this.dailyLogsRepository.save(updated));
            } else {
                // Create new - Apply snapshots
                const newLog = this.dailyLogsRepository.create({
                    ...logDto,
                    ...snapshotData
                });
                const saved = await this.dailyLogsRepository.save(newLog);
                results.push(Array.isArray(saved) ? saved[0] : saved);
            }
        }
        return results;
    }

    async findAll(date?: string, zoneId?: string, startDate?: string, endDate?: string, role?: string, page: number = 1, limit: number = 10): Promise<{ data: DailyLog[], total: number }> {
        const query = this.dailyLogsRepository.createQueryBuilder('daily_log')
            .leftJoinAndSelect('daily_log.crew', 'crew')
            // Join zone based on snapshotZoneId to get historical zone details
            .leftJoinAndMapOne('daily_log.snapshotZone', Zone, 'snapshotZone', 'snapshotZone.id = daily_log.snapshot_zone_id::uuid')
            .orderBy('daily_log.date', 'DESC');

        if (date) {
            query.andWhere('daily_log.date = :date', { date });
        }

        if (startDate && endDate) {
            query.andWhere('daily_log.date BETWEEN :startDate AND :endDate', { startDate, endDate });
        } else if (startDate) {
            query.andWhere('daily_log.date >= :startDate', { startDate });
        }

        if (zoneId && zoneId !== 'all') {
            query.andWhere('daily_log.snapshotZoneId = :zoneId', { zoneId });
        }

        if (role && role !== 'all') {
            query.andWhere('daily_log.snapshotRole = :role', { role });
        }

        const [data, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { data, total };
    }

    async getMonthlyRevenue(year: number) {
        const query = this.dailyLogsRepository.createQueryBuilder('daily_log')
            .select('EXTRACT(MONTH FROM daily_log.date)', 'month')
            .addSelect('SUM(daily_log.totalRevenue)', 'totalRevenue')
            .where('EXTRACT(YEAR FROM daily_log.date) = :year', { year })
            .groupBy('month')
            .orderBy('month', 'ASC');

        const results = await query.getRawMany();

        // Initialize array for 12 months with 0 revenue
        const monthlyRevenue = Array(12).fill(0);

        results.forEach(result => {
            const monthIndex = parseInt(result.month) - 1; // EXTRACT(MONTH) returns 1-12
            if (monthIndex >= 0 && monthIndex < 12) {
                monthlyRevenue[monthIndex] = parseFloat(result.totalRevenue) || 0;
            }
        });

        return {
            year,
            monthlyRevenue
        };
    }

    // Temporary backfill method
    // Automatic backfill method
    async backfillSnapshots() {
        // Find logs with missing snapshots
        const count = await this.dailyLogsRepository.count({ where: { snapshotZoneId: IsNull() } });

        if (count === 0) {
            this.logger.log('All daily logs have snapshot data. release check complete.');
            return;
        }

        this.logger.log(`[BACKFILL] Found ${count} logs missing snapshot data. Starting auto-migration...`);

        const logs = await this.dailyLogsRepository.find({ where: { snapshotZoneId: IsNull() } });

        let updatedCount = 0;
        for (const log of logs) {
            const crew = await this.crewRepository.findOne({ where: { id: log.crewId }, relations: ['zone'] });
            if (crew) {
                log.snapshotZoneId = crew.zone?.id;
                log.snapshotRole = crew.role;
                log.snapshotStatus = crew.status;
                log.snapshotScheduledHours = crew.scheduledHours;
                await this.dailyLogsRepository.save(log);
                updatedCount++;
            }
        }

        this.logger.log(`[BACKFILL] Successfully migrated ${updatedCount} logs.`);
        return { message: `Backfilled ${updatedCount} logs`, totalFound: count };
    }
}
