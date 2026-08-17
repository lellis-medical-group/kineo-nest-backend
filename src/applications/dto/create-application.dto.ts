import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateApplicationSchema = z.object({
  listingId: z.string(),
  message: z.string().max(2000).optional().describe('Optional message to the practice owner'),
});

export class CreateApplicationDto extends createZodDto(CreateApplicationSchema) { }