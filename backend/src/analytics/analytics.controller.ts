import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { GetPromoUsageAnalyticsDto } from './dto/get-promo-usage-analytics.dto';
import { GetPromocodeAnalyticsDto } from './dto/get-promocode-analytics.dto';
import { GetUserAnalyticsDto } from './dto/get-user-analytics.dto';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('promocodes')
  getPromocodeAnalytics(@Query() dto: GetPromocodeAnalyticsDto) {
    return this.analyticsService.getPromocodeAnalytics(dto);
  }

  @Get('promo-usages')
  getPromoUsageAnalytics(@Query() dto: GetPromoUsageAnalyticsDto) {
    return this.analyticsService.getPromoUsageAnalytics(dto);
  }

  @Get('users')
  getUserAnalytics(@Query() dto: GetUserAnalyticsDto) {
    return this.analyticsService.getUserAnalytics(dto);
  }
}
