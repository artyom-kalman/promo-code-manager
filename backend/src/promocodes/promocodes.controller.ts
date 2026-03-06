import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PromocodesService } from './promocodes.service';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { UpdatePromocodeDto } from './dto/update-promocode.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('promocodes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('promocodes')
export class PromocodesController {
  constructor(private readonly promocodesService: PromocodesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new promocode' })
  @ApiResponse({ status: 201, description: 'Promocode created successfully' })
  create(@Body() dto: CreatePromocodeDto) {
    return this.promocodesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all promocodes' })
  @ApiResponse({ status: 200, description: 'List of promocodes' })
  findAll() {
    return this.promocodesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a promocode by ID' })
  @ApiResponse({ status: 200, description: 'Promocode found' })
  findOne(@Param('id') id: string) {
    return this.promocodesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a promocode' })
  @ApiResponse({ status: 200, description: 'Promocode updated successfully' })
  update(@Param('id') id: string, @Body() dto: UpdatePromocodeDto) {
    return this.promocodesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a promocode' })
  @ApiResponse({
    status: 200,
    description: 'Promocode deactivated successfully',
  })
  deactivate(@Param('id') id: string) {
    return this.promocodesService.deactivate(id);
  }
}
