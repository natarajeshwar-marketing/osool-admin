import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Crew } from '../entities/crew.entity';
import { Building } from '../entities/building.entity';
import { Schedule } from '../entities/schedule.entity';

@Injectable()
export class DailyLogsService implements OnModuleInit {
  private readonly logger = new Logger(DailyLogsService.name);

  constructor(
    @InjectRepository(Crew)
    private crewRepository: Repository<Crew>,
    @InjectRepository(Building)
    private buildingRepository: Repository<Building>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}

  async onModuleInit() {
    this.logger.log(
      'DailyLogsService (exclusively schedules-based dashboard) initialized.',
    );
  }

  // Helper to parse 'HH:MM' time string to decimal hours
  private parseTimeToHours(timeStr: string): number {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const parts = timeStr.split(':').map(Number);
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return 0;
    return parts[0] + parts[1] / 60;
  }

  async getDashboardStats(startDate?: string, endDate?: string) {
    // 1. Total Crews (Current Db State)
    const totalCrew = await this.crewRepository.count();

    // 2. Total Buildings (Current Db State)
    const buildings = await this.buildingRepository.find();
    const totalBuildings = buildings.length;

    // Date range parsing
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Default to 1 day if start/end are not defined
    let diffDays = 1;
    if (start && end) {
      const oneDay = 24 * 60 * 60 * 1000;
      diffDays = Math.max(
        1,
        Math.round(Math.abs((end.getTime() - start.getTime()) / oneDay)) + 1,
      );
    }

    // 3. Aggregate Revenues using SQL
    const revenueQuery = this.scheduleRepository
      .createQueryBuilder('schedule')
      .select('SUM(schedule.totalCost)', 'totalRevenue')
      .addSelect(
        "SUM(CASE WHEN LOWER(schedule.serviceCategory) = 'cleaning' THEN schedule.totalCost ELSE 0 END)",
        'cleaningRevenue',
      )
      .addSelect(
        "SUM(CASE WHEN LOWER(schedule.serviceCategory) = 'maintenance' THEN schedule.totalCost ELSE 0 END)",
        'maintenanceRevenue',
      )
      .addSelect(
        "SUM(CASE WHEN LOWER(schedule.serviceCategory) = 'pest control' THEN schedule.totalCost ELSE 0 END)",
        'pestControlRevenue',
      )
      .addSelect(
        "SUM(CASE WHEN LOWER(schedule.serviceCategory) = 'car wash' THEN schedule.totalCost ELSE 0 END)",
        'carWashRevenue',
      );

    if (start && end) {
      revenueQuery.where(
        'make_date(schedule.year, schedule.month, schedule.date) BETWEEN :startDate AND :endDate',
        { startDate: start, endDate: end },
      );
    } else if (start) {
      revenueQuery.where(
        'make_date(schedule.year, schedule.month, schedule.date) >= :startDate',
        { startDate: start },
      );
    } else if (end) {
      revenueQuery.where(
        'make_date(schedule.year, schedule.month, schedule.date) <= :endDate',
        { endDate: end },
      );
    }

    const revStats = await revenueQuery.getRawOne();
    const totalRevenue = parseFloat(revStats?.totalRevenue) || 0;
    const cleaningRevenue = parseFloat(revStats?.cleaningRevenue) || 0;
    const maintenanceRevenue = parseFloat(revStats?.maintenanceRevenue) || 0;
    const pestControlRevenue = parseFloat(revStats?.pestControlRevenue) || 0;
    const carWashRevenue = parseFloat(revStats?.carWashRevenue) || 0;

    // 4. Calculate Active Crews (Distinct crews assigned to schedules) using SQL
    const activeCrewsQuery = this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoin('schedule.crews', 'crew')
      .select('COUNT(DISTINCT crew.id)', 'count');

    if (start && end) {
      activeCrewsQuery.where(
        'make_date(schedule.year, schedule.month, schedule.date) BETWEEN :startDate AND :endDate',
        { startDate: start, endDate: end },
      );
    } else if (start) {
      activeCrewsQuery.where(
        'make_date(schedule.year, schedule.month, schedule.date) >= :startDate',
        { startDate: start },
      );
    } else if (end) {
      activeCrewsQuery.where(
        'make_date(schedule.year, schedule.month, schedule.date) <= :endDate',
        { endDate: end },
      );
    }

    const activeCrewsResult = await activeCrewsQuery.getRawOne();
    const activeCrews = parseInt(activeCrewsResult?.count) || 0;

    // 5. Calculate Total Worked Hours
    const scheduleTimeQuery = this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoin('schedule.crews', 'crew')
      .select('schedule.startTime', 'startTime')
      .addSelect('schedule.endTime', 'endTime')
      .addSelect('COUNT(crew.id)', 'crewCount');

    if (start && end) {
      scheduleTimeQuery.where(
        'make_date(schedule.year, schedule.month, schedule.date) BETWEEN :startDate AND :endDate',
        { startDate: start, endDate: end },
      );
    } else if (start) {
      scheduleTimeQuery.where(
        'make_date(schedule.year, schedule.month, schedule.date) >= :startDate',
        { startDate: start },
      );
    } else if (end) {
      scheduleTimeQuery.where(
        'make_date(schedule.year, schedule.month, schedule.date) <= :endDate',
        { endDate: end },
      );
    }

    const scheduleTimes = await scheduleTimeQuery
      .groupBy('schedule.id')
      .addGroupBy('schedule.startTime')
      .addGroupBy('schedule.endTime')
      .getRawMany();

    let totalWorkedHours = 0;
    scheduleTimes.forEach((s) => {
      let duration =
        this.parseTimeToHours(s.endTime) - this.parseTimeToHours(s.startTime);
      if (duration < 0) duration += 24; // overnight schedule
      const crewCount = parseInt(s.crewCount) || 0;
      if (duration > 0 && crewCount > 0) {
        totalWorkedHours += duration * crewCount;
      }
    });

    const capacityResult = await this.crewRepository
      .createQueryBuilder('crew')
      .select('SUM(crew.scheduledHours)', 'sum')
      .getRawOne();
    const dailyCapacity = parseFloat(capacityResult?.sum) || 0;
    const totalScheduledCapacity = dailyCapacity * diffDays;

    const utilizationRate =
      totalScheduledCapacity > 0
        ? Math.min(
            100,
            Math.round((totalWorkedHours / totalScheduledCapacity) * 100),
          )
        : 0;

    // 6. Calculate Building Allocations using a flat SQL query mapped in O(N)
    const assignmentsQuery = this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoin('schedule.crews', 'crew')
      .select('schedule.buildingId', 'buildingId')
      .addSelect('schedule.startTime', 'startTime')
      .addSelect('schedule.endTime', 'endTime')
      .addSelect('crew.id', 'crewId')
      .addSelect('crew.role', 'crewRole')
      .addSelect('crew.scheduledHours', 'crewScheduledHours');

    if (start && end) {
      assignmentsQuery.where(
        'make_date(schedule.year, schedule.month, schedule.date) BETWEEN :startDate AND :endDate',
        { startDate: start, endDate: end },
      );
    } else if (start) {
      assignmentsQuery.where(
        'make_date(schedule.year, schedule.month, schedule.date) >= :startDate',
        { startDate: start },
      );
    } else if (end) {
      assignmentsQuery.where(
        'make_date(schedule.year, schedule.month, schedule.date) <= :endDate',
        { endDate: end },
      );
    }

    const assignments = await assignmentsQuery.getRawMany();

    const buildingStatsMap = new Map<
      string,
      {
        activeCrewIds: Set<string>;
        workedHours: number;
        techWorked: number;
        cleanerWorked: number;
        activeCrewScheduledHoursMap: Map<
          string,
          { role: string; scheduledHours: number }
        >;
      }
    >();

    assignments.forEach((asg) => {
      const bId = asg.buildingId || 'unknown';
      if (!buildingStatsMap.has(bId)) {
        buildingStatsMap.set(bId, {
          activeCrewIds: new Set(),
          workedHours: 0,
          techWorked: 0,
          cleanerWorked: 0,
          activeCrewScheduledHoursMap: new Map(),
        });
      }

      const stats = buildingStatsMap.get(bId)!;
      stats.activeCrewIds.add(asg.crewId);

      let duration =
        this.parseTimeToHours(asg.endTime) -
        this.parseTimeToHours(asg.startTime);
      if (duration < 0) duration += 24; // overnight schedule

      stats.workedHours += duration;
      if (asg.crewRole === 'Technician') {
        stats.techWorked += duration;
      } else if (asg.crewRole === 'Cleaner') {
        stats.cleanerWorked += duration;
      }

      if (!stats.activeCrewScheduledHoursMap.has(asg.crewId)) {
        stats.activeCrewScheduledHoursMap.set(asg.crewId, {
          role: asg.crewRole,
          scheduledHours: parseFloat(asg.crewScheduledHours) || 0,
        });
      }
    });

    const buildingAllocation = buildings.map((building) => {
      const stats = buildingStatsMap.get(building.id) || {
        activeCrewIds: new Set<string>(),
        workedHours: 0,
        techWorked: 0,
        cleanerWorked: 0,
        activeCrewScheduledHoursMap: new Map<
          string,
          { role: string; scheduledHours: number }
        >(),
      };

      let bTotalCapacity = 0;
      let bTechCapacity = 0;
      let bCleanerCapacity = 0;

      stats.activeCrewScheduledHoursMap.forEach((crewInfo) => {
        const capacity = crewInfo.scheduledHours * diffDays;
        bTotalCapacity += capacity;
        if (crewInfo.role === 'Technician') {
          bTechCapacity += capacity;
        } else if (crewInfo.role === 'Cleaner') {
          bCleanerCapacity += capacity;
        }
      });

      const utilization =
        bTotalCapacity > 0
          ? Math.min(
              100,
              Math.round((stats.workedHours / bTotalCapacity) * 100),
            )
          : 0;

      const technicianUtilization =
        bTechCapacity > 0
          ? Math.min(100, Math.round((stats.techWorked / bTechCapacity) * 100))
          : 0;

      const cleanerUtilization =
        bCleanerCapacity > 0
          ? Math.min(
              100,
              Math.round((stats.cleanerWorked / bCleanerCapacity) * 100),
            )
          : 0;

      return {
        buildingName: building.name,
        buildingId: building.id,
        activeCrewCount: stats.activeCrewIds.size,
        crewCount: stats.activeCrewIds.size,
        workedHours: parseFloat(stats.workedHours.toFixed(2)),
        totalCapacity: parseFloat(bTotalCapacity.toFixed(2)),
        utilizationRate: utilization,
        technicianUtilization,
        cleanerUtilization,
      };
    });

    return {
      totalCrew,
      activeCrews,
      utilizationRate,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      cleaningRevenue: parseFloat(cleaningRevenue.toFixed(2)),
      maintenanceRevenue: parseFloat(maintenanceRevenue.toFixed(2)),
      carWashRevenue: parseFloat(carWashRevenue.toFixed(2)),
      pestControlRevenue: parseFloat(pestControlRevenue.toFixed(2)),
      totalBuildings,
      buildingAllocation,
    };
  }

  async getMonthlyRevenue(year: number) {
    const query = this.scheduleRepository
      .createQueryBuilder('schedule')
      .select('schedule.month', 'month')
      .addSelect('SUM(schedule.totalCost)', 'totalRevenue')
      .where('schedule.year = :year', { year })
      .groupBy('schedule.month')
      .orderBy('schedule.month', 'ASC');

    const results = await query.getRawMany();

    // Initialize array for 12 months with 0 revenue
    const monthlyRevenue = Array(12).fill(0);

    results.forEach((result) => {
      const monthIndex = parseInt(result.month) - 1; // schedule.month is 1-12
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyRevenue[monthIndex] = parseFloat(result.totalRevenue) || 0;
      }
    });

    return {
      year,
      monthlyRevenue,
    };
  }
}
