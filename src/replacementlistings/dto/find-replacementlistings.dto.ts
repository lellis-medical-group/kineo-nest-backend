// src/replacement-listings/dto/find-replacementlistings.dto.ts
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Specialty } from '../../generated/prisma/enums';

export const FindReplacementListingsSchema = z.object({
  specialty: z.enum(Specialty).optional().describe('Filter by medical specialty'),
  city: z.string().optional().describe('Filter by practice city'),
  urgent: z.coerce.boolean().optional().describe('Filter urgent listings only'),
  startDateFrom: z.iso.datetime().optional().describe('Only listings starting on or after this date (ISO 8601)'),
  startDateTo: z.iso.datetime().optional().describe('Only listings starting on or before this date (ISO 8601)'),
  page: z.coerce.number().min(1).default(1).describe('Page number, starting at 1'),
  limit: z.coerce.number().min(1).max(100).default(20).describe('Number of results per page, max 100'),
});

export class FindReplacementListingsDto extends createZodDto(FindReplacementListingsSchema) {}