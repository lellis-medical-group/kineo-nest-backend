import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { ApplicationStatus } from "../../generated/prisma/enums";

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
