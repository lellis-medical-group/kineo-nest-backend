import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Session, AllowAnonymous, OptionalAuth } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { ZodSerializerDto } from 'nestjs-zod';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FindProfilesDto } from './dto/find-profiles.dto';
import { Profile, PublicProfile } from './entities/profile.entity';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @Post()
  @ApiOperation({ summary: 'Create a professional profile for the current user' })
  @ApiResponse({ status: 201, description: 'Profile created' })
  @ApiResponse({ status: 409, description: 'Profile already exists or RPPS number already in use' })
  @ZodSerializerDto(Profile)
  create(@Session() session: UserSession, @Body() createProfileDto: CreateProfileDto) {
    return this.profileService.create(session.user.id, createProfileDto);
  }

  @Get()
  @AllowAnonymous()
  @ApiOperation({ summary: 'Search public profiles' })
  @ZodSerializerDto([PublicProfile])
  findAll(@Query() query: FindProfilesDto) {
    return this.profileService.findAll(query);
  }

  @Get('me')
  @ApiOperation({ summary: "Get the current user's own profile" })
  @ApiResponse({ status: 404, description: 'No profile found for this user' })
  @ZodSerializerDto(Profile)
  findMe(@Session() session: UserSession) {
    return this.profileService.findByUserId(session.user.id);
  }

  @Get(':id')
  @OptionalAuth()
  @ApiOperation({ summary: 'Get a profile by id' })
  @ApiResponse({ status: 404, description: 'Profile not found or not public' })
  @ZodSerializerDto(PublicProfile)
  findOne(@Session() session: UserSession | undefined, @Param('id') id: string) {
    return this.profileService.findOne(id, session?.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a profile' })
  @ApiResponse({ status: 403, description: 'Not the owner of this profile' })
  @ZodSerializerDto(Profile)
  update(@Session() session: UserSession, @Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.update(id, session.user.id, updateProfileDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a profile' })
  @ApiResponse({ status: 403, description: 'Not the owner of this profile' })
  remove(@Session() session: UserSession, @Param('id') id: string) {
    return this.profileService.remove(id, session.user.id);
  }
}