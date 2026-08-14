import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Session, AllowAnonymous, OptionalAuth } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { ZodSerializerDto } from 'nestjs-zod';
import { PracticesService } from './practices.service';
import { CreatePracticeDto } from './dto/create-practice.dto';
import { UpdatePracticeDto } from './dto/update-practice.dto';
import { FindPracticesDto } from './dto/find-practices.dto';
import { PaginatedPractices, Practice } from './entities/practice.entity';

@Controller('practices')
export class PracticesController {
  constructor(private readonly practicesService: PracticesService) {}

  @Post()
  @ZodSerializerDto(Practice)
  create(@Session() session: UserSession, @Body() createPracticeDto: CreatePracticeDto) {
    return this.practicesService.create(session.user.id, createPracticeDto);
  }

  @Get()
  @AllowAnonymous()
  @ZodSerializerDto(PaginatedPractices)
  findAll(@Query() query: FindPracticesDto) {
    return this.practicesService.findAll(query);
  }

  @Get('mine')
  @ZodSerializerDto([Practice])
  findMine(@Session() session: UserSession) {
    return this.practicesService.findMine(session.user.id);
  }

  @Get(':id')
  @OptionalAuth()
  @ZodSerializerDto(Practice)
  findOne(@Session() session: UserSession | undefined, @Param('id') id: string) {
    return this.practicesService.findOne(id, session?.user.id);
  }

  @Patch(':id')
  @ZodSerializerDto(Practice)
  update(@Session() session: UserSession, @Param('id') id: string, @Body() updatePracticeDto: UpdatePracticeDto) {
    return this.practicesService.update(id, session.user.id, updatePracticeDto);
  }

  @Delete(':id')
  remove(@Session() session: UserSession, @Param('id') id: string) {
    return this.practicesService.remove(id, session.user.id);
  }
}
