import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApplicationStatus } from '../../generated/prisma/enums';

export const FindApplicationsSchema = z.object({
  listingId: z.string().optional().describe('Filter by listing id'),
  status: z.enum(ApplicationStatus).optional().describe('Filter by application status'),
  page: z.coerce.number().min(1).default(1).describe('Page number, starting at 1'),
  limit: z.coerce.number().min(1).max(100).default(20).describe('Number of results per page, max 100'),
});

export class FindApplicationsDto extends createZodDto(FindApplicationsSchema) { }