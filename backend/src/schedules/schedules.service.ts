import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Schedule } from '../entities/schedule.entity';
import { Building } from '../entities/building.entity';
import { Crew } from '../entities/crew.entity';
import { Service } from '../entities/service.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
    @InjectRepository(Crew)
    private readonly crewRepository: Repository<Crew>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const { buildingId, crews: crewIds, ...scheduleData } = createScheduleDto;

    let building: Building | null = null;
    if (buildingId) {
      building = await this.buildingRepository.findOne({
        where: { id: buildingId },
      });
      if (!building) {
        throw new NotFoundException(`Building with ID ${buildingId} not found`);
      }
    }

    let crews: Crew[] = [];
    if (crewIds && crewIds.length > 0) {
      crews = await this.crewRepository.findBy({ id: In(crewIds) });
    }

    let serviceCategory = scheduleData.serviceCategory;
    if (!serviceCategory && scheduleData.serviceName) {
      const service = await this.serviceRepository.findOne({
        where: { name: scheduleData.serviceName },
      });
      if (service) {
        serviceCategory = service.category;
      }
    }

    const schedule = this.scheduleRepository.create({
      ...scheduleData,
      serviceCategory,
      building,
      crews,
    });

    return this.scheduleRepository.save(schedule);
  }

  async findAll(
    search?: string,
    startDate?: string,
    endDate?: string,
    page?: number,
    limit?: number,
  ): Promise<Schedule[]> {
    const query = this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.building', 'building')
      .leftJoinAndSelect('schedule.crews', 'crews')
      .orderBy('schedule.year', 'DESC')
      .addOrderBy('schedule.month', 'DESC')
      .addOrderBy('schedule.date', 'DESC')
      .addOrderBy('schedule.startTime', 'ASC');

    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      query.andWhere(
        '(LOWER(schedule.tenantName) LIKE :search OR ' +
          'LOWER(schedule.serviceName) LIKE :search OR ' +
          'LOWER(schedule.buildingNumber) LIKE :search OR ' +
          'LOWER(schedule.apartmentNumber) LIKE :search OR ' +
          'LOWER(schedule.notes) LIKE :search)',
        { search: searchLower },
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      query.andWhere(
        'make_date(schedule.year, schedule.month, schedule.date) >= :startDate',
        { startDate: start },
      );
    }

    if (endDate) {
      const end = new Date(endDate);
      query.andWhere(
        'make_date(schedule.year, schedule.month, schedule.date) <= :endDate',
        { endDate: end },
      );
    }

    if (page && limit) {
      query.skip((page - 1) * limit).take(limit);
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: ['building', 'crews'],
    });
    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    return schedule;
  }

  async update(
    id: string,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    const schedule = await this.findOne(id);

    const { buildingId, crews: crewIds, ...scheduleData } = updateScheduleDto;

    if (buildingId !== undefined) {
      if (buildingId) {
        const building = await this.buildingRepository.findOne({
          where: { id: buildingId },
        });
        if (!building) {
          throw new NotFoundException(
            `Building with ID ${buildingId} not found`,
          );
        }
        schedule.building = building;
      } else {
        schedule.building = null;
      }
    }

    if (crewIds !== undefined) {
      if (crewIds && crewIds.length > 0) {
        schedule.crews = await this.crewRepository.findBy({ id: In(crewIds) });
      } else {
        schedule.crews = [];
      }
    }

    let serviceCategory = scheduleData.serviceCategory;
    const finalServiceName = scheduleData.serviceName || schedule.serviceName;
    if (!serviceCategory && finalServiceName) {
      const service = await this.serviceRepository.findOne({
        where: { name: finalServiceName },
      });
      if (service) {
        serviceCategory = service.category;
      }
    }

    if (serviceCategory) {
      scheduleData.serviceCategory = serviceCategory;
    }

    Object.assign(schedule, scheduleData);
    return this.scheduleRepository.save(schedule);
  }

  async remove(id: string): Promise<{ message: string }> {
    const schedule = await this.findOne(id);
    await this.scheduleRepository.remove(schedule);
    return { message: 'Schedule deleted successfully' };
  }
}
