import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService implements OnModuleInit {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultServices();
  }

  async seedDefaultServices(): Promise<void> {
    const count = await this.serviceRepository.count();
    if (count > 0) {
      return;
    }

    const defaultServices = [
      {
        name: 'HVAC Service',
        category: 'Maintenance',
        pricingType: 'per-service',
        rate: 250,
        status: 'Active',
        description:
          'Routine maintenance and troubleshooting for heating, ventilation, and air conditioning units.',
      },
      {
        name: 'Deep Cleaning Service',
        category: 'Cleaning',
        pricingType: 'per-service',
        rate: 350,
        status: 'Active',
        description:
          'Thorough deep cleaning services for residential and commercial units.',
      },
      {
        name: 'Pest Control Service',
        category: 'Pest Control',
        pricingType: 'per-service',
        rate: 200,
        status: 'Active',
        description:
          'General indoor and outdoor pest control treatment targeting insects and rodents.',
      },
      {
        name: 'Plumbing Repair',
        category: 'Maintenance',
        pricingType: 'hourly',
        rate: 120,
        status: 'Active',
        description:
          'Leak detection, pipe repairs, fixture installations, and generic plumbing issues.',
      },
      {
        name: 'Electrical Checkup',
        category: 'Maintenance',
        pricingType: 'hourly',
        rate: 150,
        status: 'Active',
        description:
          'Full inspection of electrical wiring, circuit breakers, and light fixture troubleshooting.',
      },
      {
        name: 'Window Washing',
        category: 'Cleaning',
        pricingType: 'contract-based',
        rate: 600,
        status: 'Inactive',
        description:
          'High-reach external window cleaning for commercial and residential buildings.',
      },
    ];

    console.log('Seeding default services into the database...');
    for (const item of defaultServices) {
      const service = this.serviceRepository.create(item);
      await this.serviceRepository.save(service);
    }
  }

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const service = this.serviceRepository.create(createServiceDto);
    return this.serviceRepository.save(service);
  }

  async findAll(page?: number, limit?: number): Promise<Service[]> {
    const options: any = {
      order: { createdAt: 'DESC' },
    };
    if (page && limit) {
      options.skip = (page - 1) * limit;
      options.take = limit;
    }
    return this.serviceRepository.find(options);
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOneBy({ id });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    return service;
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    const service = await this.findOne(id);
    Object.assign(service, updateServiceDto);
    return this.serviceRepository.save(service);
  }

  async remove(id: string): Promise<void> {
    const result = await this.serviceRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
  }
}
