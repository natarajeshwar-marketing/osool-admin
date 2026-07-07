import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCrewDto } from './dto/create-crew.dto';
import { UpdateCrewDto } from './dto/update-crew.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Crew } from '../entities/crew.entity';
import { Building } from '../entities/building.entity';
import { Schedule } from '../entities/schedule.entity';

@Injectable()
export class CrewsService {
  constructor(
    @InjectRepository(Crew)
    private crewRepository: Repository<Crew>,
    @InjectRepository(Building)
    private buildingRepository: Repository<Building>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}

  private async getCrewRevenueMap(): Promise<Map<string, number>> {
    const revenueData = await this.crewRepository.query(`
      SELECT 
        sc.crew_id AS "crewId",
        SUM(COALESCE(s.total_cost, 0) / s_counts.crew_count) AS "revenue"
      FROM schedule_crews sc
      JOIN schedules s ON s.id = sc.schedule_id
      JOIN (
        SELECT 
          schedule_id, 
          COUNT(crew_id) AS crew_count
        FROM schedule_crews
        GROUP BY schedule_id
      ) s_counts ON s_counts.schedule_id = sc.schedule_id
      GROUP BY sc.crew_id
    `);

    const map = new Map<string, number>();
    if (revenueData && Array.isArray(revenueData)) {
      revenueData.forEach((row: any) => {
        map.set(row.crewId, parseFloat(row.revenue) || 0);
      });
    }
    return map;
  }

  private async getSingleCrewRevenue(crewId: string): Promise<number> {
    const result = await this.crewRepository.query(
      `
      SELECT 
        SUM(COALESCE(s.total_cost, 0) / s_counts.crew_count) AS "revenue"
      FROM schedule_crews sc
      JOIN schedules s ON s.id = sc.schedule_id
      JOIN (
        SELECT 
          schedule_id, 
          COUNT(crew_id) AS crew_count
        FROM schedule_crews
        GROUP BY schedule_id
      ) s_counts ON s_counts.schedule_id = sc.schedule_id
      WHERE sc.crew_id = $1
      GROUP BY sc.crew_id
    `,
      [crewId],
    );
    return result && result[0] ? parseFloat(result[0].revenue) || 0 : 0;
  }

  async create(createCrewDto: CreateCrewDto) {
    const { buildingId, ...crewData } = createCrewDto;

    let building: Building | null = null;
    if (buildingId) {
      building = await this.buildingRepository.findOne({
        where: { id: buildingId },
      });
      if (!building) {
        throw new NotFoundException(`Building with ID ${buildingId} not found`);
      }
    }

    const crew = this.crewRepository.create({
      ...crewData,
      building,
    });

    const savedCrew = await this.crewRepository.save(crew);
    savedCrew.revenue = 0;
    return savedCrew;
  }

  async findAll(page?: number, limit?: number) {
    const options: any = {
      relations: ['building'],
      order: { firstName: 'ASC', lastName: 'ASC' },
    };
    if (page && limit) {
      options.skip = (page - 1) * limit;
      options.take = limit;
    }
    const crews = await this.crewRepository.find(options);
    const revenueMap = await this.getCrewRevenueMap();
    return crews.map((crew) => {
      crew.revenue = parseFloat((revenueMap.get(crew.id) || 0).toFixed(2));
      return crew;
    });
  }

  async findOne(id: string) {
    const crew = await this.crewRepository.findOne({
      where: { id },
      relations: ['building'],
    });

    if (!crew) {
      return null;
    }

    const revenue = await this.getSingleCrewRevenue(crew.id);
    crew.revenue = parseFloat(revenue.toFixed(2));
    return crew;
  }

  async update(id: string, updateCrewDto: UpdateCrewDto) {
    const crew = await this.crewRepository.findOne({
      where: { id },
      relations: ['building'],
    });

    if (!crew) {
      throw new NotFoundException(`Crew with ID ${id} not found`);
    }

    if (updateCrewDto.buildingId !== undefined) {
      if (updateCrewDto.buildingId) {
        const building = await this.buildingRepository.findOne({
          where: { id: updateCrewDto.buildingId },
        });
        if (!building) {
          throw new NotFoundException(
            `Building with ID ${updateCrewDto.buildingId} not found`,
          );
        }
        crew.building = building;
      } else {
        crew.building = null;
      }
    }

    Object.assign(crew, updateCrewDto);

    const savedCrew = await this.crewRepository.save(crew);
    const revenue = await this.getSingleCrewRevenue(savedCrew.id);
    savedCrew.revenue = parseFloat(revenue.toFixed(2));
    return savedCrew;
  }

  async remove(id: string) {
    const crew = await this.crewRepository.findOne({ where: { id } });

    if (!crew) {
      throw new NotFoundException(`Crew with ID ${id} not found`);
    }

    await this.crewRepository.delete(id);
    return { message: 'Crew deleted successfully' };
  }
}
