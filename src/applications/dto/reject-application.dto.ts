import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RejectApplicationSchema = z.object({
  rejectionReason: z.string().optional().describe('Optional reason shared with the applicant'),
});

export class RejectApplicationDto extends createZodDto(RejectApplicationSchema) {}