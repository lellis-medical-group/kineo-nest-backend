import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Session, AllowAnonymous, OptionalAuth } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { ZodSerializerDto } from 'nestjs-zod';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FindProfilesDto } from './dto/find-profiles.dto';
import { Profile, PublicProfile } from './entities/profile.entity';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  @ZodSerializerDto(Profile)
  create(@Session() session: UserSession, @Body() createProfileDto: CreateProfileDto) {
    return this.profileService.create(session.user.id, createProfileDto);
  }

  @Get()
  @AllowAnonymous()
  @ZodSerializerDto([PublicProfile])
  findAll(@Query() query: FindProfilesDto) {
    return this.profileService.findAll(query);
  }

  @Get('me')
  @ZodSerializerDto(Profile)
  findMe(@Session() session: UserSession) {
    return this.profileService.findByUserId(session.user.id);
  }

  @Get(':id')
  @OptionalAuth()
  @ZodSerializerDto(PublicProfile)
  findOne(@Session() session: UserSession | undefined, @Param('id') id: string) {
    return this.profileService.findOne(id, session?.user.id);
  }

  @Patch(':id')
  @ZodSerializerDto(Profile)
  update(@Session() session: UserSession, @Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.update(id, session.user.id, updateProfileDto);
  }

  @Delete(':id')
  remove(@Session() session: UserSession, @Param('id') id: string) {
    return this.profileService.remove(id, session.user.id);
  }
}