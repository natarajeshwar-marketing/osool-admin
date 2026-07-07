import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enquiry } from '../entities/enquiry.entity';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';

@Injectable()
export class EnquiriesService {
  constructor(
    @InjectRepository(Enquiry)
    private readonly enquiryRepository: Repository<Enquiry>,
  ) {}

  async create(createEnquiryDto: CreateEnquiryDto): Promise<Enquiry> {
    const enquiry = this.enquiryRepository.create(createEnquiryDto);
    return this.enquiryRepository.save(enquiry);
  }

  async findAll(page?: number, limit?: number): Promise<Enquiry[]> {
    const options: any = {
      order: { createdAt: 'DESC' },
    };
    if (page && limit) {
      options.skip = (page - 1) * limit;
      options.take = limit;
    }
    return this.enquiryRepository.find(options);
  }

  async findOne(id: string): Promise<Enquiry> {
    const enquiry = await this.enquiryRepository.findOneBy({ id });
    if (!enquiry) {
      throw new NotFoundException(`Enquiry with ID ${id} not found`);
    }
    return enquiry;
  }

  async update(
    id: string,
    updateEnquiryDto: UpdateEnquiryDto,
  ): Promise<Enquiry> {
    const enquiry = await this.findOne(id);
    Object.assign(enquiry, updateEnquiryDto);
    return this.enquiryRepository.save(enquiry);
  }

  async remove(id: string): Promise<void> {
    const result = await this.enquiryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Enquiry with ID ${id} not found`);
    }
  }
}
