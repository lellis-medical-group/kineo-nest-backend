import { ForbiddenException, Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { FindReplacementListingsDto } from './dto/find-replacementlistings.dto';
import { toReplacementListingDto } from './replacementlisting.mapper';
import type { CreateReplacementListingDto } from './dto/create-replacementlisting.dto';
import type { UpdateReplacementListingDto } from './dto/update-replacementlisting.dto';
import { parseLimit } from '../common/config-limits';
import type { ApplicationStatus, ListingStatus } from '../generated/prisma/enums';

const MAX_ACTIVE_LISTINGS_PER_PROFILE = parseLimit(process.env.MAX_ACTIVE_LISTINGS_PER_PROFILE);
const ACTIVE_LISTING_STATUSES: ListingStatus[] = ['DRAFT', 'OPEN', 'IN_DISCUSSION', 'FULL', 'FILLED'];
const ACTIVE_APPLICATION_STATUSES: ApplicationStatus[] = ['PENDING', 'SHORTLISTED'];

const APPLICATIONS_COUNT_INCLUDE = {
  _count: {
    select: { applications: { where: { status: { in: ACTIVE_APPLICATION_STATUSES } } } },
  },
};

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

  private withCount<T extends { _count: { applications: number } }>(listing: T) {
    const { _count, ...rest } = listing;
    return { ...rest, applicationsCount: _count.applications };
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

    if (MAX_ACTIVE_LISTINGS_PER_PROFILE) {
      const count = await this.prisma.replacementListing.count({
        where: { createdById: profileId, status: { in: ACTIVE_LISTING_STATUSES } },
      });

      if (count >= MAX_ACTIVE_LISTINGS_PER_PROFILE) {
        throw new BadRequestException(`You cannot have more than ${MAX_ACTIVE_LISTINGS_PER_PROFILE} active listings`);
      }
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

    return toReplacementListingDto({ ...listing, applicationsCount: 0 });
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
      this.prisma.replacementListing.findMany({ where, skip, take: limit, include: APPLICATIONS_COUNT_INCLUDE }),
      this.prisma.replacementListing.count({ where }),
    ]);

    return {
      data: data.map((listing) => toReplacementListingDto(this.withCount(listing))),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findMine(userId: string) {
    const profileId = await this.getOwnedProfileId(userId);

    const listings = await this.prisma.replacementListing.findMany({
      where: { createdById: profileId },
      include: APPLICATIONS_COUNT_INCLUDE,
    });

    return listings.map((listing) => toReplacementListingDto(this.withCount(listing)));
  }

  async findOne(id: string, requesterUserId?: string) {
    const listing = await this.prisma.replacementListing.findUnique({
      where: { id },
      include: APPLICATIONS_COUNT_INCLUDE,
    });

    if (!listing) {
      throw new NotFoundException(`Replacement listing ${id} not found`);
    }

    if (listing.status !== 'OPEN') {
      const profileId = requesterUserId ? await this.getOwnedProfileId(requesterUserId).catch(() => undefined) : undefined;

      if (listing.createdById !== profileId) {
        throw new NotFoundException(`Replacement listing ${id} not found`);
      }
    }

    return toReplacementListingDto(this.withCount(listing));
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

    return toReplacementListingDto({ ...updated, applicationsCount: 0 });
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
      include: APPLICATIONS_COUNT_INCLUDE,
    });

    return toReplacementListingDto(this.withCount(updated));
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
      include: APPLICATIONS_COUNT_INCLUDE,
    });

    return toReplacementListingDto(this.withCount(updated));
  }

  async cancel(id: string, userId: string) {
    const listing = await this.assertOwnership(id, userId);

    if (listing.status === 'CLOSED' || listing.status === 'CANCELLED') {
      throw new BadRequestException('This listing is already closed or cancelled');
    }

    const updated = await this.prisma.replacementListing.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: APPLICATIONS_COUNT_INCLUDE,
    });

    return toReplacementListingDto(this.withCount(updated));
  }
}