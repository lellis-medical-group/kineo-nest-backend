import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePracticeDto } from './dto/create-practice.dto';
import { UpdatePracticeDto } from './dto/update-practice.dto';
import { PrismaService } from '../prisma.service';
import type { FindPracticesDto } from './dto/find-practices.dto';

@Injectable()
export class PracticesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) { }

  private async getOwnedProfileId(userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });

    if (!profile) {
      throw new NotFoundException('No profile found for this user');
    }

    return profile.id;
  }

  private async getOwnedProfileIdSafe(userId?: string) {
    if (!userId) {
      return undefined;
    }

    const profile = await this.prisma.profile.findUnique({ where: { userId } });

    return profile?.id;
  }

  async create(userId: string, createPracticeDto: CreatePracticeDto) {
    const ownerId = await this.getOwnedProfileId(userId);

    return this.prisma.practice.create({
      data: { ...createPracticeDto, ownerId },
    });
  }

  async findAll(filters: FindPracticesDto) {
    const { name, city, lat, lng, radiusKm } = filters;
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    if (lat !== undefined && lng !== undefined && radiusKm !== undefined) {
      const [practices, countResult] = await Promise.all([
        this.prisma.$queryRaw<any[]>`
        SELECT * FROM (
          SELECT *, (
            6371 * acos(
              cos(radians(${lat})) * cos(radians(latitude)) *
              cos(radians(longitude) - radians(${lng})) +
              sin(radians(${lat})) * sin(radians(latitude))
            )
          ) AS distance
          FROM practice
          WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND "isPublic" = true
        ) sub
        WHERE distance <= ${radiusKm}
        ORDER BY distance ASC
        LIMIT ${limit} OFFSET ${skip}
      `,
        this.prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) FROM (
          SELECT *, (
            6371 * acos(
              cos(radians(${lat})) * cos(radians(latitude)) *
              cos(radians(longitude) - radians(${lng})) +
              sin(radians(${lat})) * sin(radians(latitude))
            )
          ) AS distance
          FROM practice
          WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND "isPublic" = true
        ) sub
        WHERE distance <= ${radiusKm}
      `,
      ]);

      const total = Number(countResult[0].count);

      return {
        data: practices,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    }

    const where = {
      isPublic: true,
      ...(name && { name: { contains: name, mode: 'insensitive' as const } }),
      ...(city && { city: { contains: city, mode: 'insensitive' as const } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.practice.findMany({ where, skip, take: limit }),
      this.prisma.practice.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findMine(userId: string) {
    const ownerId = await this.getOwnedProfileId(userId);

    return this.prisma.practice.findMany({ where: { ownerId } });
  }

  async findOne(id: string, requesterUserId?: string) {
    const practice = await this.prisma.practice.findUnique({ where: { id } });

    if (!practice) {
      throw new NotFoundException(`Practice ${id} not found`);
    }

    if (!practice.isPublic) {
      const ownerId = await this.getOwnedProfileIdSafe(requesterUserId);

      if (ownerId !== practice.ownerId) {
        throw new NotFoundException(`Practice ${id} not found`);
      }
    }

    return practice;
  }

  async update(id: string, userId: string, updatePracticeDto: UpdatePracticeDto) {
    const practice = await this.findOne(id, userId);
    const ownerId = await this.getOwnedProfileId(userId);

    if (practice.ownerId !== ownerId) {
      throw new ForbiddenException();
    }

    return this.prisma.practice.update({
      where: { id },
      data: updatePracticeDto,
    });
  }

  async remove(id: string, userId: string) {
    const practice = await this.findOne(id, userId);
    const ownerId = await this.getOwnedProfileId(userId);

    if (practice.ownerId !== ownerId) {
      throw new ForbiddenException();
    }

    return this.prisma.practice.delete({ where: { id } });
  }
}