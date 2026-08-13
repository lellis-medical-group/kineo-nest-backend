import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreatePracticeSchema = z.object({
  name: z.string(),
  address: z.string(),
  city: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isPublic: z.boolean().optional(),
});

export class CreatePracticeDto extends createZodDto(CreatePracticeSchema) {}