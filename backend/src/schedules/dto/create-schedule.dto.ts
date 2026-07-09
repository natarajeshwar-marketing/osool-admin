import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  Matches,
} from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  @IsOptional()
  buildingNumber?: string;

  @IsString()
  @IsOptional()
  zone?: string;

  @IsString()
  @IsOptional()
  apartmentNumber?: string;

  @IsString()
  @IsOptional()
  tenantName?: string;

  @IsString()
  @IsOptional()
  apartmentType?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  emailAddress?: string;

  @IsNumber()
  @IsNotEmpty()
  date: number;

  @IsNumber()
  @IsNotEmpty()
  month: number;

  @IsNumber()
  @IsNotEmpty()
  year: number;

  @IsString()
  @IsNotEmpty()
  frequency: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  repeatDays?: string[];

  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:MM 24-hour format',
  })
  startTime: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:MM 24-hour format',
  })
  endTime: string;

  @IsString()
  @IsNotEmpty()
  serviceName: string;

  @IsString()
  @IsOptional()
  serviceCategory?: string;

  @IsString()
  @IsOptional()
  buildingId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  crews?: string[]; // Array of Crew IDs

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsNumber()
  @IsOptional()
  baseCost?: number;

  @IsNumber()
  @IsOptional()
  vat?: number;

  @IsNumber()
  @IsOptional()
  totalCost?: number;

  @IsBoolean()
  @IsOptional()
  confirmedBooking?: boolean;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  contractEndDate?: string;

  @IsString()
  @IsOptional()
  groupId?: string;
}
