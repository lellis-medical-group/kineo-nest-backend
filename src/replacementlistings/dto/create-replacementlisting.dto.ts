import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Specialty } from '../../generated/prisma/enums';

export const CreateReplacementListingSchema = z
    .object({
        practiceId: z.string().describe('Id of the practice this listing belongs to'),
        startDate: z.coerce.date().describe('Start date of the replacement period'),
        endDate: z.coerce.date().describe('End date of the replacement period'),
        specialty: z.enum(Specialty).describe('Medical specialty required for this replacement'),
        urgent: z.boolean().optional().describe('Marks the listing as a last-minute urgent replacement'),
        description: z.string().optional().describe('Free text details about the replacement'),
    })
    .refine((data) => data.startDate < data.endDate, {
        message: 'startDate must be before endDate',
        path: ['endDate'],
    });

export class CreateReplacementListingDto extends createZodDto(CreateReplacementListingSchema) { }