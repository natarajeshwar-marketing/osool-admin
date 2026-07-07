import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { EnquiryStatus, EnquirySource } from '../../entities/enquiry.entity';

export class CreateEnquiryDto {
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsEmail()
  @IsNotEmpty()
  clientEmail: string;

  @IsString()
  @IsNotEmpty()
  clientPhone: string;

  @IsString()
  @IsNotEmpty()
  serviceName: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  buildingNumber?: string;

  @IsString()
  @IsOptional()
  apartmentNumber?: string;

  @IsString()
  @IsOptional()
  apartmentType?: string;

  @IsEnum(EnquiryStatus)
  @IsOptional()
  status?: EnquiryStatus;

  @IsEnum(EnquirySource)
  @IsOptional()
  source?: EnquirySource;
}
