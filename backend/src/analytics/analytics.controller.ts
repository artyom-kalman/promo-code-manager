import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { GetPromoUsageAnalyticsDto } from './dto/get-promo-usage-analytics.dto';
import { GetPromocodeAnalyticsDto } from './dto/get-promocode-analytics.dto';
import { GetUserAnalyticsDto } from './dto/get-user-analytics.dto';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('promocodes')
  @ApiOperation({ summary: 'Get promocode analytics' })
  @ApiResponse({ status: 200, description: 'Promocode analytics data' })
  getPromocodeAnalytics(@Query() dto: GetPromocodeAnalyticsDto) {
    return this.analyticsService.getPromocodeAnalytics(dto);
  }

  @Get('promo-usages')
  @ApiOperation({ summary: 'Get promo usage analytics' })
  @ApiResponse({ status: 200, description: 'Promo usage analytics data' })
  getPromoUsageAnalytics(@Query() dto: GetPromoUsageAnalyticsDto) {
    return this.analyticsService.getPromoUsageAnalytics(dto);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get user analytics' })
  @ApiResponse({ status: 200, description: 'User analytics data' })
  getUserAnalytics(@Query() dto: GetUserAnalyticsDto) {
    return this.analyticsService.getUserAnalytics(dto);
  }
}
