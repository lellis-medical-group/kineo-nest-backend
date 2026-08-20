import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { RejectApplicationDto } from './dto/reject-application.dto';
import { WithdrawApplicationDto } from './dto/withdraw-application.dto';
import type { FindApplicationsDto } from './dto/find-applications.dto';
import { ApplicationStatus, Prisma } from '../generated/prisma/client';
import { toApplicationDto } from './application.mapper';
import { parseLimit } from '../common/config-limits';

const ACTIVE_STATUSES: ApplicationStatus[] = ['PENDING', 'SHORTLISTED'];
const MAX_ACTIVE_APPLICATIONS_PER_PROFILE = parseLimit(process.env.MAX_ACTIVE_APPLICATIONS_PER_PROFILE);

@Injectable()
export class ApplicationsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) { }

  private async getOwnedProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });

    if (!profile) {
      throw new NotFoundException('No profile found for this user');
    }

    return profile;
  }

  private async recalcListingStatus(listingId: string) {
    const listing = await this.prisma.replacementListing.findUnique({ where: { id: listingId } });

    if (!listing || listing.status === 'FILLED' || listing.status === 'CLOSED' || listing.status === 'CANCELLED') {
      return;
    }

    const activeCount = await this.prisma.application.count({
      where: { listingId, status: { in: ACTIVE_STATUSES } },
    });

    let nextStatus = listing.status;

    if (activeCount === 0) {
      nextStatus = 'OPEN';
    } else if (listing.maxApplications && activeCount >= listing.maxApplications) {
      nextStatus = 'FULL';
    } else {
      nextStatus = 'IN_DISCUSSION';
    }

    if (nextStatus !== listing.status) {
      await this.prisma.replacementListing.update({
        where: { id: listingId },
        data: { status: nextStatus },
      });
    }
  }

  async create(userId: string, dto: CreateApplicationDto) {
    const profile = await this.getOwnedProfile(userId);

    if (profile.profileType === 'INSTALLED') {
      throw new ForbiddenException('Only replacement profiles can apply to listings');
    }

    if (MAX_ACTIVE_APPLICATIONS_PER_PROFILE) {
      const activeCount = await this.prisma.application.count({
        where: { applicantId: profile.id, status: { in: ACTIVE_STATUSES } },
      });

      if (activeCount >= MAX_ACTIVE_APPLICATIONS_PER_PROFILE) {
        throw new BadRequestException(`You cannot have more than ${MAX_ACTIVE_APPLICATIONS_PER_PROFILE} active applications`);
      }
    }

    const listing = await this.prisma.replacementListing.findUnique({ where: { id: dto.listingId } });

    if (!listing) {
      throw new NotFoundException(`Listing ${dto.listingId} not found`);
    }

    if (listing.createdById === profile.id) {
      throw new ForbiddenException('You cannot apply to your own listing');
    }

    if (listing.status !== 'OPEN' && listing.status !== 'IN_DISCUSSION') {
      throw new BadRequestException('This listing is not accepting applications');
    }

    try {
      const application = await this.prisma.application.create({
        data: {
          listingId: dto.listingId,
          applicantId: profile.id,
          message: dto.message,
        },
      });

      await this.recalcListingStatus(dto.listingId);

      return toApplicationDto(application);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('You already applied to this listing');
      }
      throw error;
    }
  }

  async findForListing(listingId: string, userId: string, filters: FindApplicationsDto) {
    const profile = await this.getOwnedProfile(userId);

    const listing = await this.prisma.replacementListing.findUnique({ where: { id: listingId } });

    if (!listing) {
      throw new NotFoundException(`Listing ${listingId} not found`);
    }

    if (listing.createdById !== profile.id) {
      throw new ForbiddenException('You do not own this listing');
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = { listingId, status: filters.status };

    const [data, total] = await Promise.all([
      this.prisma.application.findMany({ where, skip, take: limit }),
      this.prisma.application.count({ where }),
    ]);

    return {
      data: data.map(toApplicationDto),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findMine(userId: string) {
    const profile = await this.getOwnedProfile(userId);

    const applications = await this.prisma.application.findMany({ where: { applicantId: profile.id } });

    return applications.map(toApplicationDto);
  }

  private async assertAccess(id: string, userId: string) {
    const application = await this.prisma.application.findUnique({ where: { id } });

    if (!application) {
      throw new NotFoundException(`Application ${id} not found`);
    }

    const profile = await this.getOwnedProfile(userId);
    const listing = await this.prisma.replacementListing.findUniqueOrThrow({ where: { id: application.listingId } });

    const isApplicant = application.applicantId === profile.id;
    const isOwner = listing.createdById === profile.id;

    if (!isApplicant && !isOwner) {
      throw new NotFoundException(`Application ${id} not found`);
    }

    return { application, profile, listing, isApplicant, isOwner };
  }

  async findOne(id: string, userId: string) {
    const { application } = await this.assertAccess(id, userId);

    return toApplicationDto(application);
  }

  async markAsViewed(id: string, userId: string) {
    const { application, isOwner } = await this.assertAccess(id, userId);

    if (!isOwner) {
      throw new ForbiddenException();
    }

    if (application.viewedAt) {
      return toApplicationDto(application);
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: { viewedAt: new Date() },
    });

    return toApplicationDto(updated);
  }

  async update(id: string, userId: string, dto: UpdateApplicationDto) {
    const { application, isApplicant } = await this.assertAccess(id, userId);

    if (!isApplicant) {
      throw new ForbiddenException();
    }

    if (application.status !== 'PENDING') {
      throw new BadRequestException('Only pending applications can be edited');
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: { message: dto.message },
    });

    return toApplicationDto(updated);
  }

  async shortlist(id: string, userId: string) {
    const { application, isOwner } = await this.assertAccess(id, userId);

    if (!isOwner) {
      throw new ForbiddenException();
    }

    if (application.status !== 'PENDING') {
      throw new BadRequestException('Only pending applications can be shortlisted');
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: { status: 'SHORTLISTED', respondedAt: new Date() },
    });

    return toApplicationDto(updated);
  }

  async accept(id: string, userId: string) {
    const { application, isOwner, listing } = await this.assertAccess(id, userId);

    if (!isOwner) {
      throw new ForbiddenException();
    }

    if (application.status !== 'PENDING' && application.status !== 'SHORTLISTED') {
      throw new BadRequestException('Only pending or shortlisted applications can be accepted');
    }

    const [accepted] = await this.prisma.$transaction([
      this.prisma.application.update({
        where: { id },
        data: { status: 'ACCEPTED', respondedAt: new Date() },
      }),
      this.prisma.application.updateMany({
        where: {
          listingId: application.listingId,
          id: { not: id },
          status: { in: ACTIVE_STATUSES },
        },
        data: {
          status: 'REJECTED',
          rejectionReason: 'Another candidate was selected for this listing',
          respondedAt: new Date(),
        },
      }),
      this.prisma.replacementListing.update({
        where: { id: listing.id },
        data: { status: 'FILLED' },
      }),
    ]);

    return toApplicationDto(accepted);
  }

  async reject(id: string, userId: string, dto: RejectApplicationDto) {
    const { application, isOwner } = await this.assertAccess(id, userId);

    if (!isOwner) {
      throw new ForbiddenException();
    }

    if (application.status !== 'PENDING' && application.status !== 'SHORTLISTED') {
      throw new BadRequestException('Only pending or shortlisted applications can be rejected');
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: { status: 'REJECTED', rejectionReason: dto.rejectionReason, respondedAt: new Date() },
    });

    await this.recalcListingStatus(application.listingId);

    return toApplicationDto(updated);
  }

  async withdraw(id: string, userId: string, dto: WithdrawApplicationDto) {
    const { application, isApplicant } = await this.assertAccess(id, userId);

    if (!isApplicant) {
      throw new ForbiddenException();
    }

    if (application.status !== 'PENDING' && application.status !== 'SHORTLISTED') {
      throw new BadRequestException('Only pending or shortlisted applications can be withdrawn');
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: { status: 'WITHDRAWN', withdrawnReason: dto.withdrawnReason },
    });

    await this.recalcListingStatus(application.listingId);

    return toApplicationDto(updated);
  }
}