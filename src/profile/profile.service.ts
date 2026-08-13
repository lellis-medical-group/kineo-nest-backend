import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FindProfilesDto } from './dto/find-profiles.dto';

@Injectable()
export class ProfileService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async create(userId: string, createProfileDto: CreateProfileDto) {
    const existing = await this.prisma.profile.findUnique({ where: { userId } });

    if (existing) {
      throw new ConflictException('Profile already exists for this user');
    }

    return this.prisma.profile.create({
      data: { ...createProfileDto, userId },
    });
  }

  findAll(filters: FindProfilesDto) {
    return this.prisma.profile.findMany({
      where: {
        isPublic: true,
        specialty: filters.specialty,
        profileType: filters.profileType,
        city: filters.city,
      },
    });
  }

  async findOne(id: string, requesterUserId?: string) {
    const profile = await this.prisma.profile.findUnique({ where: { id } });

    if (!profile) {
      throw new NotFoundException(`Profile ${id} not found`);
    }

    if (!profile.isPublic && profile.userId !== requesterUserId) {
      throw new NotFoundException(`Profile ${id} not found`);
    }

    return profile;
  }

  async findByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });

    if (!profile) {
      throw new NotFoundException('No profile found for this user');
    }

    return profile;
  }

  async update(id: string, userId: string, updateProfileDto: UpdateProfileDto) {
    const profile = await this.findOne(id, userId);

    if (profile.userId !== userId) {
      throw new ForbiddenException();
    }

    return this.prisma.profile.update({
      where: { id },
      data: updateProfileDto,
    });
  }

  async remove(id: string, userId: string) {
    const profile = await this.findOne(id, userId);

    if (profile.userId !== userId) {
      throw new ForbiddenException();
    }

    return this.prisma.profile.delete({ where: { id } });
  }
}