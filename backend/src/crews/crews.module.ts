import { Module } from '@nestjs/common';
import { CrewsService } from './crews.service';
import { CrewsController } from './crews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Crew } from '../entities/crew.entity';
import { Building } from '../entities/building.entity';
import { Schedule } from '../entities/schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Crew, Building, Schedule])],
  controllers: [CrewsController],
  providers: [CrewsService],
})
export class CrewsModule {}
