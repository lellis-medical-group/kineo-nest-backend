import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Specialty } from '../../generated/prisma/enums';

export const UpdateReplacementListingSchema = z.object({
  startDate: z.coerce.date().optional().describe('Start date of the replacement period'),
  endDate: z.coerce.date().optional().describe('End date of the replacement period'),
  specialty: z.enum(Specialty).optional().describe('Medical specialty required for this replacement'),
  urgent: z.boolean().optional().describe('Marks the listing as a last-minute urgent replacement'),
  description: z.string().optional().describe('Free text details about the replacement'),
});

export class UpdateReplacementListingDto extends createZodDto(UpdateReplacementListingSchema) { }