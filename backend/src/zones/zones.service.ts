import { Injectable } from '@nestjs/common';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zone } from '../entities/zone.entity';
import { DailyLog } from '../entities/daily-log.entity';
import { Crew } from '../entities/crew.entity';

@Injectable()
export class ZonesService {
  constructor(
    @InjectRepository(Zone)
    private zoneRepository: Repository<Zone>,
    @InjectRepository(DailyLog)
    private dailyLogsRepository: Repository<DailyLog>,
    @InjectRepository(Crew)
    private crewRepository: Repository<Crew>,
  ) { }

  create(createZoneDto: CreateZoneDto) {
    const zone = this.zoneRepository.create(createZoneDto);
    return this.zoneRepository.save(zone);
  }

  async findAll() {
    const zones = await this.zoneRepository.find();

    // Calculate metrics for each zone
    const zonesWithMetrics = await Promise.all(zones.map(async (zone) => {
      const stats = await this.dailyLogsRepository.createQueryBuilder('log')
        .where('log.snapshotZoneId = :zoneId', { zoneId: zone.id })
        .select('SUM(log.totalRevenue)', 'totalRevenue')
        .addSelect('SUM(log.hoursWorked)', 'totalHours')
        // Use snapshot scheduled hours for capacity in that zone
        .addSelect('SUM(log.snapshotScheduledHours)', 'totalScheduled')
        .getRawOne();

      const totalRevenue = parseFloat(stats.totalRevenue) || 0;
      const totalHours = parseFloat(stats.totalHours) || 0;
      const totalScheduled = parseFloat(stats.totalScheduled) || 0;

      const utilization = totalScheduled > 0
        ? Math.round((totalHours / totalScheduled) * 100)
        : 0;

      return {
        ...zone,
        totalRevenue,
        utilization
      };
    }));

    return zonesWithMetrics;
  }

  findOne(id: string) {
    return this.zoneRepository.findOne({ where: { id } });
  }

  update(id: string, updateZoneDto: UpdateZoneDto) {
    return this.zoneRepository.update(id, updateZoneDto);
  }

  remove(id: string) {
    return this.zoneRepository.delete(id);
  }
}
