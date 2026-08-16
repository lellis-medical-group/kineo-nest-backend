// src/replacement-listings/dto/update-replacementlisting.dto.ts
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Specialty } from '../../generated/prisma/enums';

export const UpdateReplacementListingSchema = z.object({
  startDate: z.iso.datetime().optional().describe('Start date of the replacement period (ISO 8601)'),
  endDate: z.iso.datetime().optional().describe('End date of the replacement period (ISO 8601)'),
  specialty: z.enum(Specialty).optional().describe('Medical specialty required for this replacement'),
  urgent: z.boolean().optional().describe('Marks the listing as a last-minute urgent replacement'),
  description: z.string().optional().describe('Free text details about the replacement'),
});

export class UpdateReplacementListingDto extends createZodDto(UpdateReplacementListingSchema) {}