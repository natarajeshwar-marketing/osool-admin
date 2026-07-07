import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Crew } from '../entities/crew.entity';
import { Building } from '../entities/building.entity';
import { Schedule } from '../entities/schedule.entity';
import { DailyLogsService } from './daily-logs.service';
import { DailyLogsController } from './daily-logs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Crew, Building, Schedule])],
  controllers: [DailyLogsController],
  providers: [DailyLogsService],
})
export class DailyLogsModule {}
