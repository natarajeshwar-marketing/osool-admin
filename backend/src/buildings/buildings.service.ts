import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Building } from '../entities/building.entity';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
  ) {}

  async create(createBuildingDto: CreateBuildingDto): Promise<Building> {
    const building = this.buildingRepository.create(createBuildingDto);
    return this.buildingRepository.save(building);
  }

  async findAll(page?: number, limit?: number): Promise<Building[]> {
    const options: any = {
      order: { name: 'ASC' },
    };
    if (page && limit) {
      options.skip = (page - 1) * limit;
      options.take = limit;
    }
    return this.buildingRepository.find(options);
  }

  async findOne(id: string): Promise<Building> {
    const building = await this.buildingRepository.findOne({
      where: { id },
    });
    if (!building) {
      throw new NotFoundException(`Building with ID ${id} not found`);
    }
    return building;
  }

  async update(
    id: string,
    updateBuildingDto: UpdateBuildingDto,
  ): Promise<Building> {
    const building = await this.findOne(id);
    Object.assign(building, updateBuildingDto);
    return this.buildingRepository.save(building);
  }

  async remove(id: string): Promise<{ message: string }> {
    const building = await this.findOne(id);
    await this.buildingRepository.remove(building);
    return { message: 'Building deleted successfully' };
  }
}
