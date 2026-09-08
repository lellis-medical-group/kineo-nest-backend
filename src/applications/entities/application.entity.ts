import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import {
  ApplicationStatus,
  ListingStatus,
  ProfileType,
  Specialty,
} from "../../generated/prisma/enums";

/**
 * Listing snapshot embedded in application responses so the frontend can
 * render cards and details without extra fetches (no N+1, no dependency
 * on /replacement-listings/{id} visibility rules).
 */
export const ApplicationListingSchema = z.object({
  id: z.string(),
  title: z.string(),
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
  specialty: z.enum(Specialty),
  status: z.enum(ListingStatus),
  urgent: z.boolean(),
  practice: z.object({
    id: z.string(),
    name: z.string(),
    address: z.string(),
    city: z.string(),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
  }),
});

/**
 * Applicant profile embedded in application responses (public display data).
 */
export const ApplicationApplicantSchema = z.object({
  id: z.string(),
  specialty: z.enum(Specialty),
  profileType: z.enum(ProfileType),
  city: z.string().nullable(),
  verified: z.boolean(),
  user: z.object({
    name: z.string().nullable(),
    image: z.string().nullable(),
  }),
});

export const ApplicationSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  applicantId: z.string(),
  status: z.enum(ApplicationStatus),
  message: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  withdrawnReason: z.string().nullable(),
  viewedAt: z.iso.datetime().nullable(),
  respondedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  listing: ApplicationListingSchema.optional(),
  applicant: ApplicationApplicantSchema.optional(),
});

export class Application extends createZodDto(ApplicationSchema) {}

export const PaginatedApplicationsSchema = z.object({
  data: z.array(ApplicationSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export class PaginatedApplications extends createZodDto(
  PaginatedApplicationsSchema,
) {}
