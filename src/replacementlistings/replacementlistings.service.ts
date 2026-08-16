import { ForbiddenException, Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { FindReplacementListingsDto } from './dto/find-replacementlistings.dto';
import { toReplacementListingDto } from './replacementlisting.mapper';
import type { CreateReplacementListingDto } from './dto/create-replacementlisting.dto';
import type { UpdateReplacementListingDto } from './dto/update-replacementlisting.dto';

@Injectable()
export class ReplacementlistingsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) { }

  private async getOwnedProfileId(userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });

    if (!profile) {
      throw new NotFoundException('No profile found for this user');
    }

    return profile.id;
  }

  async create(userId: string, dto: CreateReplacementListingDto) {
    const profileId = await this.getOwnedProfileId(userId);

    const practice = await this.prisma.practice.findUnique({ where: { id: dto.practiceId } });

    if (!practice) {
      throw new NotFoundException(`Practice ${dto.practiceId} not found`);
    }

    if (practice.ownerId !== profileId) {
      throw new ForbiddenException('You do not own this practice');
    }

    const listing = await this.prisma.replacementListing.create({
      data: {
        practiceId: dto.practiceId,
        createdById: profileId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        specialty: dto.specialty,
        urgent: dto.urgent ?? false,
        description: dto.description,
      },
    });

    return toReplacementListingDto(listing);
  }

  async findAll(filters: FindReplacementListingsDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      status: 'OPEN' as const,
      specialty: filters.specialty,
      urgent: filters.urgent,
      startDate: filters.startDateFrom || filters.startDateTo
        ? {
          gte: filters.startDateFrom ? new Date(filters.startDateFrom) : undefined,
          lte: filters.startDateTo ? new Date(filters.startDateTo) : undefined,
        }
        : undefined,
      practice: filters.city
        ? { city: { contains: filters.city, mode: 'insensitive' as const } }
        : undefined,
    };

    const [data, total] = await Promise.all([
      this.prisma.replacementListing.findMany({ where, skip, take: limit }),
      this.prisma.replacementListing.count({ where }),
    ]);

    return {
      data: data.map(toReplacementListingDto),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findMine(userId: string) {
    const profileId = await this.getOwnedProfileId(userId);

    const listings = await this.prisma.replacementListing.findMany({ where: { createdById: profileId } });

    return listings.map(toReplacementListingDto);
  }

  async findOne(id: string, requesterUserId?: string) {
    const listing = await this.prisma.replacementListing.findUnique({ where: { id } });

    if (!listing) {
      throw new NotFoundException(`Replacement listing ${id} not found`);
    }

    if (listing.status !== 'OPEN') {
      const profileId = requesterUserId ? await this.getOwnedProfileId(requesterUserId).catch(() => undefined) : undefined;

      if (listing.createdById !== profileId) {
        throw new NotFoundException(`Replacement listing ${id} not found`);
      }
    }

    return toReplacementListingDto(listing);
  }

  private async assertOwnership(id: string, userId: string) {
    const listing = await this.prisma.replacementListing.findUnique({ where: { id } });

    if (!listing) {
      throw new NotFoundException(`Replacement listing ${id} not found`);
    }

    const profileId = await this.getOwnedProfileId(userId);

    if (listing.createdById !== profileId) {
      throw new ForbiddenException();
    }

    return listing;
  }

  async publish(id: string, userId: string) {
    const listing = await this.assertOwnership(id, userId);

    if (listing.status !== 'DRAFT') {
      throw new BadRequestException('Only draft listings can be published');
    }

    const updated = await this.prisma.replacementListing.update({
      where: { id },
      data: { status: 'OPEN' },
    });

    return toReplacementListingDto(updated);
  }

  async update(id: string, userId: string, dto: UpdateReplacementListingDto) {
    const listing = await this.assertOwnership(id, userId);

    if (listing.status === 'FILLED' || listing.status === 'CLOSED' || listing.status === 'CANCELLED') {
      throw new BadRequestException('This listing can no longer be modified');
    }

    const updated = await this.prisma.replacementListing.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });

    return toReplacementListingDto(updated);
  }

  async remove(id: string, userId: string) {
    const listing = await this.assertOwnership(id, userId);

    if (listing.status === 'FILLED') {
      throw new BadRequestException('A filled listing cannot be deleted, close it instead');
    }

    return this.prisma.replacementListing.delete({ where: { id } });
  }

  async close(id: string, userId: string) {
    const listing = await this.assertOwnership(id, userId);

    if (listing.status !== 'OPEN' && listing.status !== 'FILLED') {
      throw new BadRequestException('Only open or filled listings can be closed');
    }

    const updated = await this.prisma.replacementListing.update({
      where: { id },
      data: { status: 'CLOSED' },
    });

    return toReplacementListingDto(updated);
  }

  async cancel(id: string, userId: string) {
    const listing = await this.assertOwnership(id, userId);

    if (listing.status === 'CLOSED' || listing.status === 'CANCELLED') {
      throw new BadRequestException('This listing is already closed or cancelled');
    }

    const updated = await this.prisma.replacementListing.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return toReplacementListingDto(updated);
  }
}