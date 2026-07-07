import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DailyLogsService } from './daily-logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('daily-logs')
@UseGuards(JwtAuthGuard)
export class DailyLogsController {
  constructor(private readonly dailyLogsService: DailyLogsService) {}

  @Get('stats')
  getDashboardStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.dailyLogsService.getDashboardStats(startDate, endDate);
  }

  @Get('revenue')
  getMonthlyRevenue(@Query('year') year: number) {
    return this.dailyLogsService.getMonthlyRevenue(year);
  }
}
